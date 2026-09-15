"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export default function QuizResultPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("sessionId")
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    const loadResult = async (id: string) => {
      try {
        const response = await fetch(`/api/game/session/${id}`)
        const data = await response.json()

        if (response.ok) {
          setResult(data.result)
          setLoading(false)
        } else {
          throw new Error(data.error || "Erreur lors du chargement des résultats")
        }
      } catch {
        setLoading(false)
        setError("Erreur lors du chargement des résultats")
      }
    }

    if (sessionId) {
      loadResult(sessionId)
    } else {
      setLoading(false)
          setError("Session ID manquant")
    }
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des résultats...</p>
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
          <Link href="/" className="block w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors text-center">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🏆 Quiz Terminé!</h1>
          <p className="text-gray-600">Voici vos résultats</p>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-blue-600">{result?.gameSession?.score || result?.stats?.totalPoints || 0}</div>
              <div className="text-sm text-gray-600">Points</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-600">{result?.stats?.correctCount || 0}</div>
              <div className="text-sm text-gray-600">Correctes</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-yellow-600">{result?.stats?.totalCount || 0}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-purple-600">{result?.stats?.accuracy?.toFixed(1) || 0}%</div>
              <div className="text-sm text-gray-600">Précision</div>
            </div>
          </div>

          {/* Detailed answers */}
          {result?.gameSession?.answers && result.gameSession.answers.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Détail des réponses</h3>
              <div className="space-y-3">
                {result.gameSession.answers.map((answer: any, index: number) => (
                  <div key={answer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-3">Q{index + 1}</span>
                      <span className={answer.isCorrect ? "text-green-600" : "text-red-600"}>
                        {answer.isCorrect ? "✓" : "✗"}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-gray-800">
                      +{answer.pointsEarned} pts
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <button
              onClick={() => router.push("/game/quiz")}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Jouer à nouveau
            </button>
            <Link href="/" className="block w-full bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors text-center">
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}