import { prisma } from "@/lib/prisma"
import { QuestionStatus, QuestionSource, Difficulty, Language, QuestionType } from "@/types/question"

export interface QuestionFilter {
  category?: string
  subcategory?: string
  difficulty?: Difficulty
  language?: Language
  type?: QuestionType
  status?: QuestionStatus
  source?: QuestionSource
  limit?: number
  offset?: number
}

export interface QuestionData {
  type: QuestionType
  category: string
  subcategory?: string
  difficulty: Difficulty
  language: Language
  questionText: string
  explanation?: string
  points?: number
  timeLimit?: number
  options?: Array<{
    text: string
    isCorrect: boolean
    order: number
  }>
}

export class QuestionBankService {
  /**
   * Create a new question
   */
  static async createQuestion(
    data: QuestionData,
    userId: string,
    source: QuestionSource = QuestionSource.MANUAL
  ) {
    return await prisma.question.create({
      data: {
        source,
        status: QuestionStatus.DRAFT,
        type: data.type,
        category: data.category,
        subcategory: data.subcategory,
        difficulty: data.difficulty,
        language: data.language,
        questionText: data.questionText,
        explanation: data.explanation,
        points: data.points || 10,
        timeLimit: data.timeLimit,
        createdBy: userId,
        options: data.options ? {
          create: data.options.map(opt => ({
            text: opt.text,
            isCorrect: opt.isCorrect,
            order: opt.order
          }))
        } : undefined
      },
      include: {
        options: true,
        creator: {
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
   * Get question by ID (without correct answers for public access)
   */
  static async getQuestionById(id: string, includeAnswers = false) {
    return await prisma.question.findUnique({
      where: { id },
      include: {
        options: includeAnswers ? true : {
          select: {
            id: true,
            text: true,
            order: true
            // isCorrect is excluded for security
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        validator: {
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
   * Filter questions based on criteria
   */
  static async getQuestions(filter: QuestionFilter) {
    const where: Record<string, unknown> = {}

    if (filter.category) where.category = filter.category
    if (filter.subcategory) where.subcategory = filter.subcategory
    if (filter.difficulty) where.difficulty = filter.difficulty
    if (filter.language) where.language = filter.language
    if (filter.type) where.type = filter.type
    if (filter.status) where.status = filter.status
    if (filter.source) where.source = filter.source

    return await prisma.question.findMany({
      where,
      include: {
        options: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      take: filter.limit || 50,
      skip: filter.offset || 0,
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  /**
   * Update question
   */
  static async updateQuestion(id: string, data: Partial<QuestionData>) {
    const { options: _options, ...questionData } = data
    
    return await prisma.question.update({
      where: { id },
      data: {
        ...questionData,
        status: QuestionStatus.DRAFT, // Reset to draft on update
        updatedAt: new Date()
      },
      include: {
        options: true
      }
    })
  }

  /**
   * Validate question (admin only)
   */
  static async validateQuestion(id: string, validatorId: string, approved: boolean) {
    return await prisma.question.update({
      where: { id },
      data: {
        status: approved ? QuestionStatus.APPROVED : QuestionStatus.REJECTED,
        validatedBy: validatorId,
        validatedAt: new Date()
      }
    })
  }

  /**
   * Archive question
   */
  static async archiveQuestion(id: string) {
    return await prisma.question.update({
      where: { id },
      data: {
        status: QuestionStatus.ARCHIVED
      }
    })
  }

  /**
   * Delete question (soft delete via archive)
   */
  static async deleteQuestion(id: string) {
    return await this.archiveQuestion(id)
  }

  /**
   * Get question statistics
   */
  static async getStatistics() {
    const [
      total,
      approved,
      draft,
      rejected,
      byCategory,
      byDifficulty
    ] = await Promise.all([
      prisma.question.count(),
      prisma.question.count({ where: { status: QuestionStatus.APPROVED } }),
      prisma.question.count({ where: { status: QuestionStatus.DRAFT } }),
      prisma.question.count({ where: { status: QuestionStatus.REJECTED } }),
      prisma.question.groupBy({
        by: ['category'],
        _count: true
      }),
      prisma.question.groupBy({
        by: ['difficulty'],
        _count: true
      })
    ])

    return {
      total,
      approved,
      draft,
      rejected,
      byCategory: byCategory.map(cat => ({
        category: cat.category,
        count: cat._count
      })),
      byDifficulty: byDifficulty.map(diff => ({
        difficulty: diff.difficulty,
        count: diff._count
      }))
    }
  }

  /**
   * Check if question can be used in public games
   */
  static async isQuestionPlayable(id: string): Promise<boolean> {
    const question = await prisma.question.findUnique({
      where: { id },
      select: { status: true }
    })

    return question?.status === QuestionStatus.APPROVED
  }
}