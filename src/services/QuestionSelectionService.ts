import { prisma } from "@/lib/prisma"
import { QuestionStatus, Difficulty, Language, QuestionType } from "@/types/question"

export interface SelectionCriteria {
  category?: string
  subcategory?: string
  difficulty?: Difficulty
  language?: Language
  type?: QuestionType
  numberOfQuestions: number
  excludeIds?: string[] // Questions to exclude (already played recently)
}

export class QuestionSelectionService {
  /**
   * Select questions automatically based on criteria
   */
  static async selectQuestions(criteria: SelectionCriteria) {
    const where: any = {
      status: QuestionStatus.APPROVED // Only select approved questions
    }

    if (criteria.category) where.category = criteria.category
    if (criteria.subcategory) where.subcategory = criteria.subcategory
    if (criteria.difficulty) where.difficulty = criteria.difficulty
    if (criteria.language) where.language = criteria.language
    if (criteria.type) where.type = criteria.type

    // Exclude specified question IDs
    if (criteria.excludeIds && criteria.excludeIds.length > 0) {
      where.id = {
        notIn: criteria.excludeIds
      }
    }

    // Get available questions
    const availableQuestions = await prisma.question.findMany({
      where,
      include: {
        options: {
          select: {
            id: true,
            text: true,
            order: true
            // isCorrect excluded for security
          }
        }
      },
      take: criteria.numberOfQuestions * 2 // Get more than needed for variety
      orderBy: {
        createdAt: 'desc' // Get newer questions first
      }
    })

    // Shuffle and select the required number
    const shuffled = this.shuffleArray(availableQuestions)
    const selected = shuffled.slice(0, criteria.numberOfQuestions)

    return selected
  }

  /**
   * Select questions for a specific quiz
   */
  static async selectForQuiz(quizId: string, userId?: string) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            question: {
              include: {
                options: {
                  select: {
                    id: true,
                    text: true,
                    order: true
                  }
                }
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    if (!quiz) {
      throw new Error("Quiz not found")
    }

    // Get recently played questions for this user (if provided)
    let excludeIds: string[] = []
    if (userId) {
      const recentAnswers = await prisma.playerAnswer.findMany({
        where: {
          gameSession: {
            userId
          },
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        select: {
          questionId: true
        },
        distinct: ['questionId']
      })

      excludeIds = recentAnswers.map(a => a.questionId)
    }

    // Check if quiz has enough valid questions
    const validQuestions = quiz.questions.filter(qq => 
      qq.question.status === QuestionStatus.APPROVED &&
      !excludeIds.includes(qq.questionId)
    )

    if (validQuestions.length < quiz.questionCount) {
      // Need to select additional questions
      const additionalQuestions = await this.selectQuestions({
        category: quiz.category,
        difficulty: quiz.difficulty as Difficulty,
        language: quiz.language as Language,
        numberOfQuestions: quiz.questionCount - validQuestions.length,
        excludeIds: [...excludeIds, ...validQuestions.map(q => q.questionId)]
      })

      return {
        questions: [
          ...validQuestions.map(qq => qq.question),
          ...additionalQuestions
        ],
        quiz
      }
    }

    return {
      questions: validQuestions.map(qq => qq.question),
      quiz
    }
  }

  /**
   * Get random questions from category
   */
  static async getRandomQuestions(
    category: string,
    count: number,
    difficulty?: Difficulty
  ) {
    return await this.selectQuestions({
      category,
      difficulty,
      numberOfQuestions: count
    })
  }

  /**
   * Check if sufficient questions are available
   */
  static async checkAvailability(criteria: SelectionCriteria): Promise<boolean> {
    const where: any = {
      status: QuestionStatus.APPROVED
    }

    if (criteria.category) where.category = criteria.category
    if (criteria.subcategory) where.subcategory = criteria.subcategory
    if (criteria.difficulty) where.difficulty = criteria.difficulty
    if (criteria.language) where.language = criteria.language
    if (criteria.type) where.type = criteria.type

    if (criteria.excludeIds && criteria.excludeIds.length > 0) {
      where.id = {
        notIn: criteria.excludeIds
      }
    }

    const count = await prisma.question.count({ where })

    return count >= criteria.numberOfQuestions
  }

  /**
   * Get available question counts by category
   */
  static async getAvailableCounts(category?: string) {
    const where: any = {
      status: QuestionStatus.APPROVED
    }

    if (category) where.category = category

    const counts = await prisma.question.groupBy({
      by: ['category', 'difficulty'],
      where,
      _count: true
    })

    return counts.map(c => ({
      category: c.category,
      difficulty: c.difficulty,
      count: c._count
    }))
  }

  /**
   * Fisher-Yates shuffle algorithm
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }
}