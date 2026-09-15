import { prisma } from "@/lib/prisma"
import { GameType, GameStatus, Difficulty, QuestionOption } from "@/types/question"
import { ScoringService } from "./ScoringService"
import { QuestionBankService } from "./QuestionBankService"

export interface GameSessionData {
  userId: string
  gameType: GameType
  quizId?: string
}

export interface AnswerData {
  gameSessionId: string
  questionId: string
  answer: string
  isCorrect?: boolean
  responseTime: number
}

export class GameService {
  /**
   * Create a new game session
   */
  static async createSession(data: GameSessionData) {
    return await prisma.gameSession.create({
      data: {
        userId: data.userId,
        gameType: data.gameType,
        quizId: data.quizId,
        status: GameStatus.IN_PROGRESS
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
  }

  /**
   * Get game session by ID
   */
  static async getSession(id: string) {
    return await prisma.gameSession.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        quiz: true,
        answers: {
          include: {
            question: {
              select: {
                id: true,
                questionText: true,
                type: true,
                category: true,
                difficulty: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })
  }

  /**
   * Submit an answer for a question
   */
  static async submitAnswer(data: AnswerData) {
    // Get game session first
    const gameSession = await prisma.gameSession.findUnique({
      where: { id: data.gameSessionId }
    })

    if (!gameSession) {
      throw new Error("Game session not found")
    }

    // Get question details for scoring and validation
    const question = await QuestionBankService.getQuestionById(data.questionId, true)
    
    if (!question) {
      throw new Error("Question not found")
    }

    // Determine if answer is correct (server-side validation)
    const correctOption = question.options?.find((opt: QuestionOption) => opt.isCorrect)
    const isCorrect = correctOption?.id === data.answer

    // Calculate score
    const scoreResult = await ScoringService.calculateScore({
      basePoints: question.points,
      difficulty: question.difficulty as Difficulty,
      responseTime: data.responseTime,
      timeLimit: question.timeLimit ?? undefined
    })

    // Save the answer
    const answer = await prisma.playerAnswer.create({
      data: {
        gameSessionId: data.gameSessionId,
        questionId: data.questionId,
        answer: data.answer,
        isCorrect,
        pointsEarned: isCorrect ? scoreResult.points : 0,
        responseTime: data.responseTime
      }
    })

    // Update game session score
    await prisma.gameSession.update({
      where: { id: data.gameSessionId },
      data: {
        score: {
          increment: answer.pointsEarned
        }
      }
    })

    // Update user progression if correct
    if (isCorrect) {
      await ScoringService.updateProgression(gameSession.userId, answer.pointsEarned)
      await ScoringService.updateStreak(gameSession.userId, true)
    } else {
      await ScoringService.updateStreak(gameSession.userId, false)
    }

    return {
      answer,
      scoreResult,
      gameSession
    }
  }

  /**
   * Complete a game session
   */
  static async completeSession(gameSessionId: string) {
    const gameSession = await prisma.gameSession.update({
      where: { id: gameSessionId },
      data: {
        status: GameStatus.COMPLETED,
        completedAt: new Date()
      },
      include: {
        answers: true
      }
    })

    // Calculate final stats
    const stats = await ScoringService.calculateGameScore(gameSessionId)

    // Update max score
    if (stats.totalPoints !== null) {
      await prisma.gameSession.update({
        where: { id: gameSessionId },
        data: {
          maxScore: stats.totalPoints
        }
      })
    }

    return {
      gameSession,
      stats
    }
  }

  /**
   * Abandon a game session
   */
  static async abandonSession(gameSessionId: string) {
    return await prisma.gameSession.update({
      where: { id: gameSessionId },
      data: {
        status: GameStatus.ABANDONED,
        completedAt: new Date()
      }
    })
  }

  /**
   * Get user's game history
   */
  static async getUserHistory(userId: string, limit = 20) {
    return await prisma.gameSession.findMany({
      where: { userId },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            category: true
          }
        },
        answers: {
          select: {
            isCorrect: true,
            pointsEarned: true
          }
        }
      },
      orderBy: {
        startedAt: 'desc'
      },
      take: limit
    })
  }

  /**
   * Get user's statistics
   */
  static async getUserStats(userId: string) {
    const [
      totalGames,
      completedGames,
      totalScore,
      averageScore,
      byGameType
    ] = await Promise.all([
      prisma.gameSession.count({ where: { userId } }),
      prisma.gameSession.count({ 
        where: { 
          userId,
          status: GameStatus.COMPLETED
        } 
      }),
      prisma.gameSession.aggregate({
        where: { userId },
        _sum: { score: true }
      }),
      prisma.gameSession.aggregate({
        where: { 
          userId,
          status: GameStatus.COMPLETED
        },
        _avg: { score: true }
      }),
      prisma.gameSession.groupBy({
        by: ['gameType'],
        where: { userId },
        _count: true,
        _sum: { score: true }
      })
    ])

    return {
      totalGames,
      completedGames,
      totalScore: totalScore._sum.score || 0,
      averageScore: averageScore._avg.score || 0,
      byGameType: byGameType.map(stat => ({
        gameType: stat.gameType,
        count: stat._count,
        totalScore: stat._sum.score || 0
      }))
    }
  }

  /**
   * Get active game session for user
   */
  static async getActiveSession(userId: string) {
    return await prisma.gameSession.findFirst({
      where: {
        userId,
        status: GameStatus.IN_PROGRESS
      },
      include: {
        quiz: true,
        answers: {
          include: {
            question: {
              select: {
                id: true,
                questionText: true,
                type: true
              }
            }
          }
        }
      }
    })
  }

  /**
   * Resume an existing game session
   */
  static async resumeSession(gameSessionId: string) {
    const session = await this.getSession(gameSessionId)
    
    if (!session) {
      throw new Error("Game session not found")
    }

    if (session.status !== GameStatus.IN_PROGRESS) {
      throw new Error("Cannot resume a completed or abandoned game")
    }

    return session
  }
}