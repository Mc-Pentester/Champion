import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { QuestionBankService } from '../QuestionBankService'
import { prisma } from '@/lib/prisma'
import { QuestionSource, QuestionStatus, QuestionType, Difficulty, Language } from '@/types/question'

describe('QuestionBankService', () => {
  let testUserId: string

  beforeEach(async () => {
    // Create a test user with truly unique email
    const timestamp = Date.now() + Math.random()
    const user = await prisma.user.create({
      data: {
        email: `test-${timestamp}@example.com`,
        name: 'Test User',
        password: 'hashedpassword',
        role: 'ADMIN'
      }
    })
    testUserId = user.id
  })

  afterEach(async () => {
    // Clean up test data
    try {
      await prisma.question.deleteMany({
        where: { createdBy: testUserId }
      })
      await prisma.user.delete({
        where: { id: testUserId }
      })
    } catch {
      // User might not exist if test failed before creation
    }
  })

  describe('createQuestion', () => {
    it('should create a new question with options', async () => {
      const questionData = {
        type: QuestionType.MULTIPLE_CHOICE,
        category: 'FRANCAIS',
        subcategory: 'GRAMMAIRE',
        difficulty: Difficulty.EASY,
        language: Language.FR,
        questionText: 'Test question',
        explanation: 'Test explanation',
        points: 10,
        options: [
          { text: 'Option A', isCorrect: false, order: 1 },
          { text: 'Option B', isCorrect: true, order: 2 },
          { text: 'Option C', isCorrect: false, order: 3 },
          { text: 'Option D', isCorrect: false, order: 4 }
        ]
      }

      const question = await QuestionBankService.createQuestion(
        questionData,
        testUserId,
        QuestionSource.MANUAL
      )

      expect(question).toBeDefined()
      expect(question.questionText).toBe('Test question')
      expect(question.status).toBe(QuestionStatus.DRAFT)
      expect(question.source).toBe(QuestionSource.MANUAL)
      expect(question.options).toHaveLength(4)
    })

    it('should create a question without options', async () => {
      const questionData = {
        type: QuestionType.TEXT_INPUT,
        category: 'FRANCAIS',
        difficulty: Difficulty.EASY,
        language: Language.FR,
        questionText: 'Test question without options',
        points: 10
      }

      const question = await QuestionBankService.createQuestion(
        questionData,
        testUserId
      )

      expect(question).toBeDefined()
      expect(question.options).toHaveLength(0)
    })
  })

  describe('getQuestionById', () => {
    it('should return question without correct answers by default', async () => {
      const questionData = {
        type: QuestionType.MULTIPLE_CHOICE,
        category: 'FRANCAIS',
        difficulty: Difficulty.EASY,
        language: Language.FR,
        questionText: 'Test question',
        options: [
          { text: 'Option A', isCorrect: false, order: 1 },
          { text: 'Option B', isCorrect: true, order: 2 }
        ]
      }

      const created = await QuestionBankService.createQuestion(questionData, testUserId)
      const retrieved = await QuestionBankService.getQuestionById(created.id, false)

      expect(retrieved).toBeDefined()
      expect(retrieved?.options[0]).not.toHaveProperty('isCorrect')
    })

    it('should return question with correct answers when requested', async () => {
      const questionData = {
        type: QuestionType.MULTIPLE_CHOICE,
        category: 'FRANCAIS',
        difficulty: Difficulty.EASY,
        language: Language.FR,
        questionText: 'Test question',
        options: [
          { text: 'Option A', isCorrect: false, order: 1 },
          { text: 'Option B', isCorrect: true, order: 2 }
        ]
      }

      const created = await QuestionBankService.createQuestion(questionData, testUserId)
      const retrieved = await QuestionBankService.getQuestionById(created.id, true)

      expect(retrieved).toBeDefined()
      expect(retrieved?.options[0]).toHaveProperty('isCorrect')
    })
  })

  describe('validateQuestion', () => {
    it('should approve a question', async () => {
      const questionData = {
        type: QuestionType.MULTIPLE_CHOICE,
        category: 'FRANCAIS',
        difficulty: Difficulty.EASY,
        language: Language.FR,
        questionText: 'Test question',
        options: [
          { text: 'Option A', isCorrect: false, order: 1 },
          { text: 'Option B', isCorrect: true, order: 2 }
        ]
      }

      const created = await QuestionBankService.createQuestion(questionData, testUserId)
      const validated = await QuestionBankService.validateQuestion(created.id, testUserId, true)

      expect(validated.status).toBe(QuestionStatus.APPROVED)
      expect(validated.validatedBy).toBe(testUserId)
      expect(validated.validatedAt).toBeDefined()
    })

    it('should reject a question', async () => {
      const questionData = {
        type: QuestionType.MULTIPLE_CHOICE,
        category: 'FRANCAIS',
        difficulty: Difficulty.EASY,
        language: Language.FR,
        questionText: 'Test question',
        options: [
          { text: 'Option A', isCorrect: false, order: 1 },
          { text: 'Option B', isCorrect: true, order: 2 }
        ]
      }

      const created = await QuestionBankService.createQuestion(questionData, testUserId)
      const validated = await QuestionBankService.validateQuestion(created.id, testUserId, false)

      expect(validated.status).toBe(QuestionStatus.REJECTED)
    })
  })

  describe('isQuestionPlayable', () => {
    it('should return true for approved questions', async () => {
      const questionData = {
        type: QuestionType.MULTIPLE_CHOICE,
        category: 'FRANCAIS',
        difficulty: Difficulty.EASY,
        language: Language.FR,
        questionText: 'Test question',
        options: [
          { text: 'Option A', isCorrect: false, order: 1 },
          { text: 'Option B', isCorrect: true, order: 2 }
        ]
      }

      const created = await QuestionBankService.createQuestion(questionData, testUserId)
      await QuestionBankService.validateQuestion(created.id, testUserId, true)

      const isPlayable = await QuestionBankService.isQuestionPlayable(created.id)
      expect(isPlayable).toBe(true)
    })

    it('should return false for draft questions', async () => {
      const questionData = {
        type: QuestionType.MULTIPLE_CHOICE,
        category: 'FRANCAIS',
        difficulty: Difficulty.EASY,
        language: Language.FR,
        questionText: 'Test question',
        options: [
          { text: 'Option A', isCorrect: false, order: 1 },
          { text: 'Option B', isCorrect: true, order: 2 }
        ]
      }

      const created = await QuestionBankService.createQuestion(questionData, testUserId)

      const isPlayable = await QuestionBankService.isQuestionPlayable(created.id)
      expect(isPlayable).toBe(false)
    })
  })
})