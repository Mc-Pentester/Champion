import { prisma } from "@/lib/prisma"
import { QuestionBankService } from "./QuestionBankService"
import { ScoringService } from "./ScoringService"
import { Difficulty, QuestionType, Language, QuestionStatus } from "@/types/question"

export interface RiddleData {
  riddleText: string
  answer: string
  hints: Array<{
    text: string
    penalty: number
  }>
  difficulty: Difficulty
  timeLimit?: number
}

export interface RiddleGameData {
  questionId: string
  currentHints: number
  maxHints: number
  startTime: number
}

export class RiddleService {
  /**
   * Create a new riddle
   */
  static async createRiddle(data: RiddleData, userId: string) {
    // First create the base question
    const question = await QuestionBankService.createQuestion(
      {
        type: QuestionType.RIDDLE,
        category: "DEVINETTES",
        subcategory: "DEVINETTES_CLASSIQUES",
        difficulty: data.difficulty,
        language: Language.FR,
        questionText: data.riddleText,
        explanation: `Réponse: ${data.answer}`,
        points: 20,
        timeLimit: data.timeLimit
      },
      userId
    )

    // Then create the riddle-specific data
    const riddle = await prisma.riddle.create({
      data: {
        questionId: question.id,
        riddleText: data.riddleText,
        answer: data.answer.toLowerCase().trim(),
        hints: JSON.stringify(data.hints),
        difficulty: data.difficulty,
        timeLimit: data.timeLimit
      },
      include: {
        question: true
      }
    })

    return riddle
  }

  /**
   * Get riddle by ID (without answer)
   */
  static async getRiddleById(id: string) {
    const riddle = await prisma.riddle.findUnique({
      where: { id },
      include: {
        question: {
          include: {
            options: true
          }
        }
      }
    })

    if (!riddle) return null

    // Return without the answer
    return {
      ...riddle,
      answer: undefined,
      hints: JSON.parse(riddle.hints)
    }
  }

  /**
   * Get a hint for a riddle
   */
  static async getHint(riddleId: string, hintIndex: number) {
    const riddle = await prisma.riddle.findUnique({
      where: { id: riddleId }
    })

    if (!riddle) {
      throw new Error("Riddle not found")
    }

    const hints = JSON.parse(riddle.hints)

    if (hintIndex < 0 || hintIndex >= hints.length) {
      throw new Error("Invalid hint index")
    }

    return {
      hint: hints[hintIndex].text,
      penalty: hints[hintIndex].penalty,
      remainingHints: hints.length - hintIndex - 1
    }
  }

  /**
   * Check riddle answer
   */
  static async checkAnswer(
    riddleId: string,
    userAnswer: string,
    hintsUsed: number = 0
  ) {
    const riddle = await prisma.riddle.findUnique({
      where: { id: riddleId },
      include: {
        question: true
      }
    })

    if (!riddle) {
      throw new Error("Riddle not found")
    }

    const normalizedUserAnswer = userAnswer.toLowerCase().trim()
    const isCorrect = normalizedUserAnswer === riddle.answer

    // Calculate score with hint penalties
    const hints = JSON.parse(riddle.hints)
    let totalPenalty = 0

    for (let i = 0; i < hintsUsed; i++) {
      if (hints[i]) {
        totalPenalty += hints[i].penalty
      }
    }

    const scoreResult = await ScoringService.calculateScore({
      basePoints: riddle.question.points,
      difficulty: riddle.difficulty as Difficulty,
      hintsUsed: totalPenalty
    })

    return {
      isCorrect,
      points: isCorrect ? scoreResult.points : 0,
      breakdown: scoreResult.breakdown,
      correctAnswer: isCorrect ? undefined : riddle.answer
    }
  }

  /**
   * Get random riddle
   */
  static async getRandomRiddle(difficulty?: Difficulty) {
    const questions = await QuestionBankService.getQuestions({
      category: "DEVINETTES",
      type: QuestionType.RIDDLE,
      difficulty,
      status: QuestionStatus.APPROVED,
      limit: 10
    })

    if (questions.length === 0) {
      throw new Error("No riddles available")
    }

    const randomQuestion = questions[Math.floor(Math.random() * questions.length)]
    return await this.getRiddleById(randomQuestion.id)
  }

  /**
   * Get riddle with all hints
   */
  static async getRiddleWithHints(riddleId: string) {
    const riddle = await prisma.riddle.findUnique({
      where: { id: riddleId }
    })

    if (!riddle) return null

    return {
      ...riddle,
      answer: undefined,
      hints: JSON.parse(riddle.hints),
      totalHints: JSON.parse(riddle.hints).length
    }
  }

  /**
   * Update riddle
   */
  static async updateRiddle(id: string, data: Partial<RiddleData>) {
    const riddle = await prisma.riddle.update({
      where: { id },
      data: {
        ...(data.riddleText && { riddleText: data.riddleText }),
        ...(data.answer && { answer: data.answer.toLowerCase().trim() }),
        ...(data.hints && { hints: JSON.stringify(data.hints) }),
        ...(data.difficulty && { difficulty: data.difficulty }),
        ...(data.timeLimit !== undefined && { timeLimit: data.timeLimit })
      }
    })

    // Update the base question if needed
    if (data.riddleText || data.difficulty || data.timeLimit) {
      await QuestionBankService.updateQuestion(riddle.questionId, {
        questionText: data.riddleText,
        difficulty: data.difficulty,
        timeLimit: data.timeLimit
      })
    }

    return riddle
  }

  /**
   * Delete riddle
   */
  static async deleteRiddle(id: string) {
    const riddle = await prisma.riddle.findUnique({
      where: { id }
    })

    if (!riddle) {
      throw new Error("Riddle not found")
    }

    // Archive the base question
    await QuestionBankService.archiveQuestion(riddle.questionId)

    // Delete the riddle
    await prisma.riddle.delete({
      where: { id }
    })

    return true
  }

  /**
   * Get riddle statistics
   */
  static async getStatistics() {
    const riddles = await prisma.riddle.findMany({
      include: {
        question: true
      }
    })

    const byDifficulty = riddles.reduce((acc, riddle) => {
      acc[riddle.difficulty] = (acc[riddle.difficulty] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total: riddles.length,
      byDifficulty
    }
  }
}