import { prisma } from "@/lib/prisma"
import { SudokuSize, Difficulty, GameStatus } from "@/types/question"

export interface SudokuGrid {
  size: number
  puzzle: number[][]
  solution: number[][]
}

export interface SudokuMove {
  row: number
  col: number
  value: number
}

export class SudokuService {
  /**
   * Generate a Sudoku puzzle
   */
  static generatePuzzle(size: SudokuSize, difficulty: Difficulty): SudokuGrid {
    const gridSize = this.getSizeValue(size)
    const boxSize = Math.sqrt(gridSize)
    
    // Generate a complete valid Sudoku
    const solution = this.generateCompleteSudoku(gridSize, boxSize)
    
    // Remove numbers based on difficulty
    const puzzle = this.removeNumbers(solution, difficulty)
    
    return {
      size: gridSize,
      puzzle,
      solution
    }
  }

  /**
   * Create a new Sudoku puzzle in database
   */
  static async createSudoku(size: SudokuSize, difficulty: Difficulty) {
    const grid = this.generatePuzzle(size, difficulty)
    
    return await prisma.sudoku.create({
      data: {
        size,
        difficulty,
        puzzle: JSON.stringify(grid.puzzle),
        solution: JSON.stringify(grid.solution)
      }
    })
  }

  /**
   * Get Sudoku by ID
   */
  static async getSudokuById(id: string) {
    const sudoku = await prisma.sudoku.findUnique({
      where: { id }
    })

    if (!sudoku) return null

    return {
      ...sudoku,
      puzzle: JSON.parse(sudoku.puzzle),
      solution: JSON.parse(sudoku.solution)
    }
  }

  /**
   * Start a Sudoku game session
   */
  static async startSession(sudokuId: string, userId: string) {
    const sudoku = await this.getSudokuById(sudokuId)
    
    if (!sudoku) {
      throw new Error("Sudoku not found")
    }

    return await prisma.sudokuGameSession.create({
      data: {
        sudokuId,
        userId,
        currentState: JSON.stringify(sudoku.puzzle),
        status: GameStatus.IN_PROGRESS
      },
      include: {
        sudoku: true
      }
    })
  }

  /**
   * Make a move in Sudoku
   */
  static async makeMove(sessionId: string, move: SudokuMove) {
    const session = await prisma.sudokuGameSession.findUnique({
      where: { id: sessionId },
      include: {
        sudoku: true
      }
    })

    if (!session) {
      throw new Error("Session not found")
    }

    if (session.status !== GameStatus.IN_PROGRESS) {
      throw new Error("Game is not in progress")
    }

    const currentState = JSON.parse(session.currentState)
    const solution = JSON.parse(session.sudoku.solution)

    // Check if move is valid
    const isCorrect = solution[move.row][move.col] === move.value

    if (!isCorrect) {
      // Increment mistake counter
      await prisma.sudokuGameSession.update({
        where: { id: sessionId },
        data: {
          mistakes: {
            increment: 1
          }
        }
      })

      return {
        success: false,
        correct: false,
        mistakes: session.mistakes + 1
      }
    }

    // Update the grid
    currentState[move.row][move.col] = move.value

    // Check if puzzle is complete
    const isComplete = this.isPuzzleComplete(currentState, solution)

    const updatedSession = await prisma.sudokuGameSession.update({
      where: { id: sessionId },
      data: {
        currentState: JSON.stringify(currentState),
        status: isComplete ? GameStatus.COMPLETED : GameStatus.IN_PROGRESS,
        completedAt: isComplete ? new Date() : null
      }
    })

    return {
      success: true,
      correct: true,
      isComplete,
      session: updatedSession
    }
  }

  /**
   * Get Sudoku session by ID
   */
  static async getSession(sessionId: string) {
    const session = await prisma.sudokuGameSession.findUnique({
      where: { id: sessionId },
      include: {
        sudoku: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!session) return null

    return {
      ...session,
      currentState: JSON.parse(session.currentState),
      sudoku: {
        ...session.sudoku,
        puzzle: JSON.parse(session.sudoku.puzzle)
      }
    }
  }

  /**
   * Update session time
   */
  static async updateTime(sessionId: string, elapsedSeconds: number) {
    return await prisma.sudokuGameSession.update({
      where: { id: sessionId },
      data: {
        timeElapsed: elapsedSeconds
      }
    })
  }

  /**
   * Abandon Sudoku session
   */
  static async abandonSession(sessionId: string) {
    return await prisma.sudokuGameSession.update({
      where: { id: sessionId },
      data: {
        status: GameStatus.ABANDONED,
        completedAt: new Date()
      }
    })
  }

  /**
   * Get user's Sudoku history
   */
  static async getUserHistory(userId: string, limit = 20) {
    return await prisma.sudokuGameSession.findMany({
      where: { userId },
      include: {
        sudoku: {
          select: {
            id: true,
            size: true,
            difficulty: true
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
   * Get random Sudoku puzzle
   */
  static async getRandomPuzzle(size?: SudokuSize, difficulty?: Difficulty) {
    const where: any = {}

    if (size) where.size = size
    if (difficulty) where.difficulty = difficulty

    const puzzles = await prisma.sudoku.findMany({
      where,
      take: 10
    })

    if (puzzles.length === 0) {
      // Generate a new puzzle if none exists
      const newSize = size || SudokuSize.SUDOKU_9X9
      const newDifficulty = difficulty || Difficulty.MEDIUM
      const newPuzzle = await this.createSudoku(newSize, newDifficulty)
      return this.getSudokuById(newPuzzle.id)
    }

    const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)]
    return this.getSudokuById(randomPuzzle.id)
  }

  /**
   * Validate a Sudoku grid
   */
  static validateGrid(grid: number[][], size: number): boolean {
    const boxSize = Math.sqrt(size)

    // Check rows
    for (let row = 0; row < size; row++) {
      const seen = new Set()
      for (let col = 0; col < size; col++) {
        const value = grid[row][col]
        if (value !== 0) {
          if (seen.has(value)) return false
          seen.add(value)
        }
      }
    }

    // Check columns
    for (let col = 0; col < size; col++) {
      const seen = new Set()
      for (let row = 0; row < size; row++) {
        const value = grid[row][col]
        if (value !== 0) {
          if (seen.has(value)) return false
          seen.add(value)
        }
      }
    }

    // Check boxes
    for (let boxRow = 0; boxRow < boxSize; boxRow++) {
      for (let boxCol = 0; boxCol < boxSize; boxCol++) {
        const seen = new Set()
        for (let row = boxRow * boxSize; row < (boxRow + 1) * boxSize; row++) {
          for (let col = boxCol * boxSize; col < (boxCol + 1) * boxSize; col++) {
            const value = grid[row][col]
            if (value !== 0) {
              if (seen.has(value)) return false
              seen.add(value)
            }
          }
        }
      }
    }

    return true
  }

  /**
   * Check if a puzzle is complete
   */
  static isPuzzleComplete(current: number[][], solution: number[][]): boolean {
    for (let row = 0; row < current.length; row++) {
      for (let col = 0; col < current[row].length; col++) {
        if (current[row][col] !== solution[row][col]) {
          return false
        }
      }
    }
    return true
  }

  // Helper methods

  private static getSizeValue(size: SudokuSize): number {
    switch (size) {
      case SudokuSize.SUDOKU_4X4: return 4
      case SudokuSize.SUDOKU_6X6: return 6
      case SudokuSize.SUDOKU_9X9: return 9
      default: return 9
    }
  }

  private static generateCompleteSudoku(size: number, boxSize: number): number[][] {
    const grid = Array(size).fill(null).map(() => Array(size).fill(0))
    
    // Fill diagonal boxes first (they are independent)
    for (let i = 0; i < size; i += boxSize) {
      this.fillBox(grid, i, i, boxSize)
    }
    
    // Solve the rest
    this.solveSudoku(grid, size, boxSize)
    
    return grid
  }

  private static fillBox(grid: number[][], row: number, col: number, boxSize: number) {
    let num
    for (let i = 0; i < boxSize; i++) {
      for (let j = 0; j < boxSize; j++) {
        do {
          num = Math.floor(Math.random() * boxSize * boxSize) + 1
        } while (!this.isSafeInBox(grid, row, col, num, boxSize))
        grid[row + i][col + j] = num
      }
    }
  }

  private static isSafeInBox(grid: number[][], rowStart: number, colStart: number, num: number, boxSize: number): boolean {
    for (let i = 0; i < boxSize; i++) {
      for (let j = 0; j < boxSize; j++) {
        if (grid[rowStart + i][colStart + j] === num) {
          return false
        }
      }
    }
    return true
  }

  private static solveSudoku(grid: number[][], size: number, boxSize: number): boolean {
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (grid[row][col] === 0) {
          for (let num = 1; num <= size; num++) {
            if (this.isSafe(grid, row, col, num, size, boxSize)) {
              grid[row][col] = num
              if (this.solveSudoku(grid, size, boxSize)) {
                return true
              }
              grid[row][col] = 0
            }
          }
          return false
        }
      }
    }
    return true
  }

  private static isSafe(grid: number[][], row: number, col: number, num: number, size: number, boxSize: number): boolean {
    // Check row
    for (let x = 0; x < size; x++) {
      if (grid[row][x] === num) return false
    }

    // Check column
    for (let x = 0; x < size; x++) {
      if (grid[x][col] === num) return false
    }

    // Check box
    const startRow = row - row % boxSize
    const startCol = col - col % boxSize
    for (let i = 0; i < boxSize; i++) {
      for (let j = 0; j < boxSize; j++) {
        if (grid[startRow + i][startCol + j] === num) return false
      }
    }

    return true
  }

  private static removeNumbers(solution: number[][], difficulty: Difficulty): number[][] {
    const puzzle = solution.map(row => [...row])
    const size = solution.length
    let cellsToRemove: number

    switch (difficulty) {
      case Difficulty.BEGINNER:
        cellsToRemove = Math.floor(size * size * 0.3)
        break
      case Difficulty.EASY:
        cellsToRemove = Math.floor(size * size * 0.4)
        break
      case Difficulty.MEDIUM:
        cellsToRemove = Math.floor(size * size * 0.5)
        break
      case Difficulty.HARD:
        cellsToRemove = Math.floor(size * size * 0.6)
        break
      case Difficulty.EXPERT:
        cellsToRemove = Math.floor(size * size * 0.7)
        break
      default:
        cellsToRemove = Math.floor(size * size * 0.5)
    }

    let removed = 0
    while (removed < cellsToRemove) {
      const row = Math.floor(Math.random() * size)
      const col = Math.floor(Math.random() * size)
      
      if (puzzle[row][col] !== 0) {
        puzzle[row][col] = 0
        removed++
      }
    }

    return puzzle
  }

  public static isPuzzleComplete(current: number[][], solution: number[][]): boolean {
    for (let row = 0; row < current.length; row++) {
      for (let col = 0; col < current[row].length; col++) {
        if (current[row][col] !== solution[row][col]) {
          return false
        }
      }
    }
    return true
  }
}