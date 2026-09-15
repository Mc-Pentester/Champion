"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function QuizPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [gameSession, setGameSession] = useState<any>(null)
  const [currentQuestion, setCurrentQuestion] = useState<any>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null)
  const [isCorrectResult, setIsCorrectResult] = useState(false)
  const [answerSubmitted, setAnswerSubmitted] = useState(false)
  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<any[]>([])
  const [startTime, setStartTime] = useState<number>(Date.now())

  useEffect(() => {
    // Check for active session or create new one
    checkActiveSession()
  }, [])

  const checkActiveSession = async () => {
    try {
      const response = await fetch("/api/game/session")
      const data = await response.json()

      if (data.session) {
        setGameSession(data.session)
        // Load questions for this session
        await loadQuestions(data.session.id)
      } else {
        // Create new session
        await createNewSession()
      }
    } catch (err) {
      setError("Erreur lors du chargement de la session")
      setLoading(false)
    }
  }

  const createNewSession = async () => {
    try {
      const response = await fetch("/api/game/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameType: "QUIZ"
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setGameSession(data.gameSession)
        await loadQuestions(data.gameSession.id)
      } else {
        setError(data.error || "Erreur lors de la création de la session")
        setLoading(false)
      }
    } catch (err) {
      setError("Erreur lors de la création de la session")
      setLoading(false)
    }
  }

  const loadQuestions = async (sessionId: string) => {
    try {
      // Select 10 random questions for the quiz
      const response = await fetch("/api/questions/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "FRANCAIS",
          difficulty: "EASY",
          numberOfQuestions: 10
        })
      })

      const data = await response.json()
      
      if (response.ok && data.questions && data.questions.length > 0) {
        setQuestions(data.questions)
        setCurrentQuestion(data.questions[0])
        setLoading(false)
      } else {
        setError("Aucune question disponible")
        setLoading(false)
      }
    } catch (err) {
      setError("Erreur lors du chargement des questions")
      setLoading(false)
    }
  }

  const handleAnswerSelect = (answerId: string) => {
    if (answerSubmitted) return
    setSelectedAnswer(answerId)
  }

  const submitAnswer = async () => {
    if (!selectedAnswer || !currentQuestion || !gameSession) return

    setAnswerSubmitted(true)
    const responseTime = Date.now() - startTime

    try {
      // Submit answer to server - server will determine if correct
      const response = await fetch("/api/game/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameSessionId: gameSession.id,
          questionId: currentQuestion.id,
          answer: selectedAnswer,
          responseTime
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        const isCorrect = data.result.answer.isCorrect
        const correctOption = currentQuestion.options.find((opt: any) => opt.isCorrect)

        setIsCorrectResult(isCorrect)
        if (isCorrect && correctOption) {
          setCorrectAnswer(correctOption.text)
        }

        setAnswers([...answers, {
          questionId: currentQuestion.id,
          answer: selectedAnswer,
          isCorrect,
          pointsEarned: data.result.answer.pointsEarned
        }])
        setShowResult(true)
      } else {
        setError(data.error || "Erreur lors de la soumission de la réponse")
      }
    } catch (err) {
      setError("Erreur lors de la soumission de la réponse")
    }
  }

  const nextQuestion = () => {
    setShowResult(false)
    setSelectedAnswer(null)
    setAnswerSubmitted(false)
    setCorrectAnswer(null)
    setIsCorrectResult(false)
    setStartTime(performance.now())

    if (questionIndex < questions.length - 1) {
      const nextIndex = questionIndex + 1
      setQuestionIndex(nextIndex)
      setCurrentQuestion(questions[nextIndex])
    } else {
      // Quiz completed
      completeQuiz()
    }
  }

  const completeQuiz = async () => {
    try {
      const response = await fetch(`/api/game/session/${gameSession.id}`, {
        method: "POST"
      })

      if (response.ok) {
        router.push(`/game/quiz/result?sessionId=${gameSession.id}`)
      } else {
        setError("Erreur lors de la finalisation du quiz")
      }
    } catch {
      setError("Erreur lors de la finalisation du quiz")
    }
  }

  const abandonQuiz = async () => {
    if (!gameSession) return

    try {
      await fetch(`/api/game/session/${gameSession.id}`, {
        method: "DELETE"
      })
      router.push("/")
    } catch {
      setError("Erreur lors de l&apos;abandon du quiz")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du quiz...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Erreur</h2>
            <p className="text-gray-600">{error}</p>
          </div>
          <div className="space-y-4">
            <button
              onClick={checkActiveSession}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Réessayer
            </button>
            <Link href="/" className="block w-full bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors text-center">
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Aucune question disponible</p>
          <Link href="/" className="mt-4 inline-block bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Quiz Classique</h1>
              <p className="text-sm text-gray-600">Question {questionIndex + 1} / {questions.length}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Score: {gameSession?.score || 0}</p>
              <button
                onClick={abandonQuiz}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Abandonner
              </button>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">
              {currentQuestion.category}
            </span>
            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded ml-2">
              {currentQuestion.difficulty}
            </span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {currentQuestion.questionText}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options && currentQuestion.options.map((option: any) => (
              <button
                key={option.id}
                onClick={() => handleAnswerSelect(option.id)}
                disabled={answerSubmitted}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                  selectedAnswer === option.id
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                } ${answerSubmitted ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                    selectedAnswer === option.id ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                  }`}></div>
                  <span className="text-gray-800">{option.text}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Result feedback */}
          {showResult && (
            <div className={`mt-6 p-4 rounded-lg ${
              isCorrectResult ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`font-semibold ${isCorrectResult ? 'text-green-800' : 'text-red-800'}`}>
                {isCorrectResult ? '✓ Correct!' : '✗ Incorrect'}
              </p>
              {currentQuestion.explanation && (
                <p className="text-sm text-gray-600 mt-2">{currentQuestion.explanation}</p>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-6">
            {!answerSubmitted ? (
              <button
                onClick={submitAnswer}
                disabled={!selectedAnswer}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Soumettre
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                {questionIndex < questions.length - 1 ? 'Question suivante' : 'Voir les résultats'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}