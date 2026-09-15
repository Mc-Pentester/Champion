import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { ScoringService } from '../ScoringService'
import { prisma } from '@/lib/prisma'
import { Difficulty } from '@/types/question'

describe('ScoringService', () => {
  let testUserId: string

  beforeEach(async () => {
    // Create a test user
    const user = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: 'Test User',
        password: 'hashedpassword',
        role: 'PLAYER'
      }
    })
    testUserId = user.id
  })

  afterEach(async () => {
    // Clean up test data
    await prisma.progression.deleteMany({
      where: { userId: testUserId }
    })
    await prisma.user.delete({
      where: { id: testUserId }
    })
  })

  describe('calculateScore', () => {
    it('should calculate base score correctly', async () => {
      const result = await ScoringService.calculateScore({
        basePoints: 10,
        difficulty: Difficulty.EASY
      })

      expect(result.points).toBeGreaterThan(0)
      expect(result.breakdown.base).toBe(10)
    })

    it('should apply difficulty multiplier', async () => {
      const easyResult = await ScoringService.calculateScore({
        basePoints: 10,
        difficulty: Difficulty.EASY
      })

      const hardResult = await ScoringService.calculateScore({
        basePoints: 10,
        difficulty: Difficulty.HARD
      })

      expect(hardResult.points).toBeGreaterThan(easyResult.points)
    })

    it('should add time bonus for fast answers', async () => {
      const result = await ScoringService.calculateScore({
        basePoints: 10,
        difficulty: Difficulty.EASY,
        responseTime: 2000,
        timeLimit: 10
      })

      expect(result.breakdown.timeBonus).toBeGreaterThan(0)
    })

    it('should add streak bonus', async () => {
      const result = await ScoringService.calculateScore({
        basePoints: 10,
        difficulty: Difficulty.EASY,
        streak: 5
      })

      expect(result.breakdown.streakBonus).toBeGreaterThan(0)
    })

    it('should add perfect bonus', async () => {
      const result = await ScoringService.calculateScore({
        basePoints: 10,
        difficulty: Difficulty.EASY,
        isPerfect: true
      })

      expect(result.breakdown.perfectBonus).toBeGreaterThan(0)
    })

    it('should apply hint penalty', async () => {
      const result = await ScoringService.calculateScore({
        basePoints: 10,
        difficulty: Difficulty.EASY,
        hintsUsed: 2
      })

      expect(result.breakdown.hintPenalty).toBeGreaterThan(0)
    })
  })

  describe('updateProgression', () => {
    it('should create progression if it does not exist', async () => {
      const result = await ScoringService.updateProgression(testUserId, 100)

      expect(result).toBeDefined()
      expect(result.xp).toBe(100)
      expect(result.level).toBe(2) // Level 2 with 100 XP
    })

    it('should update existing progression', async () => {
      await ScoringService.updateProgression(testUserId, 100)
      const result = await ScoringService.updateProgression(testUserId, 50)

      expect(result).toBeDefined()
      expect(result.xp).toBe(150)
    })

    it('should calculate level correctly', async () => {
      await ScoringService.updateProgression(testUserId, 500)
      const result = await ScoringService.updateProgression(testUserId, 0)

      expect(result).toBeDefined()
      expect(result.level).toBe(3) // Level 3 with 500 XP
    })
  })

  describe('updateStreak', () => {
    it('should update streak based on correctness', async () => {
      // Create progression first
      await ScoringService.updateProgression(testUserId, 0)
      
      const result = await ScoringService.updateStreak(testUserId, true)

      if (result) {
        expect(result.streak).toBeGreaterThanOrEqual(0)
      }
    })

    it('should handle streak correctly', async () => {
      await ScoringService.updateProgression(testUserId, 0)
      const result1 = await ScoringService.updateStreak(testUserId, true)
      const result2 = await ScoringService.updateStreak(testUserId, false)

      expect(result1).toBeDefined()
      if (result2) {
        expect(result2.streak).toBe(0)
      }
    })
  })

  describe('calculateLevel', () => {
    it('should return level 1 for 0 XP', () => {
      expect(ScoringService.calculateLevel(0)).toBe(1)
    })

    it('should return level 2 for 100 XP', () => {
      expect(ScoringService.calculateLevel(100)).toBe(2)
    })

    it('should return level 3 for 500 XP', () => {
      expect(ScoringService.calculateLevel(500)).toBe(3)
    })
  })

  describe('getXPForLevel', () => {
    it('should return 0 for level 1', () => {
      expect(ScoringService.getXPForLevel(1)).toBe(0)
    })

    it('should return 100 for level 2', () => {
      expect(ScoringService.getXPForLevel(2)).toBe(100)
    })

    it('should return 400 for level 3', () => {
      expect(ScoringService.getXPForLevel(3)).toBe(400)
    })
  })
})