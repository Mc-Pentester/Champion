import { prisma } from "@/lib/prisma"
import { Difficulty } from "@/types/question"

export interface ScoringContext {
  basePoints: number
  difficulty: Difficulty
  responseTime?: number // in milliseconds
  timeLimit?: number // in seconds
  streak?: number
  isPerfect?: boolean
  hintsUsed?: number
}

export interface ScoreResult {
  points: number
  breakdown: {
    base: number
    difficultyMultiplier: number
    timeBonus: number
    streakBonus: number
    perfectBonus: number
    hintPenalty: number
  }
}

export class ScoringService {
  private static config = {
    basePoints: 10,
    difficultyMultipliers: {
      BEGINNER: 1.0,
      EASY: 1.2,
      MEDIUM: 1.5,
      HARD: 2.0,
      EXPERT: 2.5,
      MASTER: 3.0,
      LEGEND: 4.0
    },
    timeBonus: 5,
    streakBonus: 10,
    perfectBonus: 20,
    hintPenalty: 5,
    timeBonusThreshold: 0.5 // Bonus if answered within 50% of time limit
  }

  /**
   * Calculate score for a single answer
   */
  static async calculateScore(context: ScoringContext): Promise<ScoreResult> {
    const breakdown = {
      base: context.basePoints,
      difficultyMultiplier: this.config.difficultyMultipliers[context.difficulty],
      timeBonus: 0,
      streakBonus: 0,
      perfectBonus: 0,
      hintPenalty: 0
    }

    // Calculate time bonus
    if (context.responseTime && context.timeLimit) {
      const timeLimitMs = context.timeLimit * 1000
      const timeRatio = context.responseTime / timeLimitMs
      
      if (timeRatio <= this.config.timeBonusThreshold) {
        breakdown.timeBonus = this.config.timeBonus
      }
    }

    // Calculate streak bonus
    if (context.streak && context.streak >= 5) {
      breakdown.streakBonus = this.config.streakBonus * Math.floor(context.streak / 5)
    }

    // Calculate perfect bonus
    if (context.isPerfect) {
      breakdown.perfectBonus = this.config.perfectBonus
    }

    // Calculate hint penalty
    if (context.hintsUsed && context.hintsUsed > 0) {
      breakdown.hintPenalty = this.config.hintPenalty * context.hintsUsed
    }

    // Calculate final score
    const points = Math.max(0, Math.round(
      breakdown.base * breakdown.difficultyMultiplier +
      breakdown.timeBonus +
      breakdown.streakBonus +
      breakdown.perfectBonus -
      breakdown.hintPenalty
    ))

    return { points, breakdown }
  }

  /**
   * Update user's XP and check for level up
   */
  static async updateProgression(userId: string, points: number) {
    const progression = await prisma.progression.findUnique({
      where: { userId }
    })

    if (!progression) {
      // Create progression if it doesn't exist
      return await prisma.progression.create({
        data: {
          userId,
          xp: points,
          level: this.calculateLevel(points),
          lastPlayedAt: new Date()
        }
      })
    }

    const newXP = progression.xp + points
    const newLevel = this.calculateLevel(newXP)

    return await prisma.progression.update({
      where: { userId },
      data: {
        xp: newXP,
        level: newLevel,
        lastPlayedAt: new Date()
      }
    })
  }

  /**
   * Update user's streak
   */
  static async updateStreak(userId: string, correct: boolean) {
    const progression = await prisma.progression.findUnique({
      where: { userId }
    })

    if (!progression) return null

    const now = new Date()
    const lastPlayed = progression.lastPlayedAt ? new Date(progression.lastPlayedAt) : null
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const lastPlayedDay = lastPlayed ? new Date(lastPlayed.getFullYear(), lastPlayed.getMonth(), lastPlayed.getDate()) : null

    let newStreak = progression.streak

    if (correct) {
      if (!lastPlayedDay) {
        // First game
        newStreak = 1
      } else if (lastPlayedDay.getTime() === today.getTime()) {
        // Already played today, keep streak
        newStreak = progression.streak
      } else if (lastPlayedDay.getTime() === today.getTime() - 24 * 60 * 60 * 1000) {
        // Played yesterday, increment streak
        newStreak = progression.streak + 1
      } else {
        // Streak broken, start new
        newStreak = 1
      }
    } else {
      // Wrong answer, reset streak
      newStreak = 0
    }

    return await prisma.progression.update({
      where: { userId },
      data: {
        streak: newStreak,
        lastPlayedAt: now
      }
    })
  }

  /**
   * Calculate level based on XP
   */
  static calculateLevel(xp: number): number {
    // Level formula: level = 1 + floor(sqrt(xp / 100))
    return 1 + Math.floor(Math.sqrt(xp / 100))
  }

  /**
   * Get XP required for a specific level
   */
  static getXPForLevel(level: number): number {
    return Math.pow(level - 1, 2) * 100
  }

  /**
   * Get scoring configuration
   */
  static async getConfig() {
    const dbConfig = await prisma.scoringConfig.findFirst()
    
    if (dbConfig) {
      return {
        basePoints: dbConfig.basePoints,
        difficultyMultipliers: JSON.parse(dbConfig.difficultyMultiplier),
        timeBonus: dbConfig.timeBonus,
        streakBonus: dbConfig.streakBonus,
        perfectBonus: dbConfig.perfectBonus,
        hintPenalty: dbConfig.hintPenalty
      }
    }

    return this.config
  }

  /**
   * Update scoring configuration (admin only)
   */
  static async updateConfig(config: Partial<typeof ScoringService.config>) {
    const existingConfig = await prisma.scoringConfig.findFirst()

    if (existingConfig) {
      return await prisma.scoringConfig.update({
        where: { id: existingConfig.id },
        data: {
          ...config,
          difficultyMultiplier: config.difficultyMultipliers 
            ? JSON.stringify(config.difficultyMultipliers)
            : existingConfig.difficultyMultiplier
        }
      })
    }

    return await prisma.scoringConfig.create({
      data: {
        basePoints: config.basePoints ?? this.config.basePoints,
        difficultyMultiplier: JSON.stringify(
          config.difficultyMultipliers ?? this.config.difficultyMultipliers
        ),
        timeBonus: config.timeBonus ?? this.config.timeBonus,
        streakBonus: config.streakBonus ?? this.config.streakBonus,
        perfectBonus: config.perfectBonus ?? this.config.perfectBonus,
        hintPenalty: config.hintPenalty ?? this.config.hintPenalty
      }
    })
  }

  /**
   * Calculate total score for a game session
   */
  static async calculateGameScore(gameSessionId: string) {
    const answers = await prisma.playerAnswer.findMany({
      where: { gameSessionId }
    })

    const totalPoints = answers.reduce((sum, answer) => sum + answer.pointsEarned, 0)
    const correctCount = answers.filter(a => a.isCorrect).length
    const totalCount = answers.length
    const accuracy = totalCount > 0 ? (correctCount / totalCount) * 100 : 0

    return {
      totalPoints,
      correctCount,
      totalCount,
      accuracy
    }
  }
}