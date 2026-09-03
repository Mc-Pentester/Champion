import { describe, it, expect } from '@jest/globals'
import { SudokuService } from '../SudokuService'
import { SudokuSize, Difficulty } from '@/types/question'

describe('SudokuService', () => {
  describe('generatePuzzle', () => {
    it('should generate a 4x4 puzzle', () => {
      const grid = SudokuService.generatePuzzle(SudokuSize.SUDOKU_4X4, Difficulty.EASY)

      expect(grid.size).toBe(4)
      expect(grid.puzzle).toHaveLength(4)
      expect(grid.solution).toHaveLength(4)
    })

    it('should generate a 9x9 puzzle', () => {
      const grid = SudokuService.generatePuzzle(SudokuSize.SUDOKU_9X9, Difficulty.MEDIUM)

      expect(grid.size).toBe(9)
      expect(grid.puzzle).toHaveLength(9)
      expect(grid.solution).toHaveLength(9)
    })

    it('should have valid solution', () => {
      const grid = SudokuService.generatePuzzle(SudokuSize.SUDOKU_9X9, Difficulty.MEDIUM)
      const isValid = SudokuService.validateGrid(grid.solution, 9)

      expect(isValid).toBe(true)
    })

    it('should have empty cells in puzzle', () => {
      const grid = SudokuService.generatePuzzle(SudokuSize.SUDOKU_9X9, Difficulty.MEDIUM)
      
      let emptyCells = 0
      for (const row of grid.puzzle) {
        for (const cell of row) {
          if (cell === 0) emptyCells++
        }
      }

      expect(emptyCells).toBeGreaterThan(0)
    })
  })

  describe('validateGrid', () => {
    it('should validate a correct Sudoku grid', () => {
      const validGrid = [
        [1, 2, 3, 4],
        [3, 4, 1, 2],
        [2, 1, 4, 3],
        [4, 3, 2, 1]
      ]

      const isValid = SudokuService.validateGrid(validGrid, 4)
      expect(isValid).toBe(true)
    })

    it('should reject invalid grid with duplicate in row', () => {
      const invalidGrid = [
        [1, 1, 3, 4],
        [3, 4, 1, 2],
        [2, 1, 4, 3],
        [4, 3, 2, 1]
      ]

      const isValid = SudokuService.validateGrid(invalidGrid, 4)
      expect(isValid).toBe(false)
    })

    it('should reject invalid grid with duplicate in column', () => {
      const invalidGrid = [
        [1, 2, 3, 4],
        [1, 4, 1, 2],
        [2, 1, 4, 3],
        [4, 3, 2, 1]
      ]

      const isValid = SudokuService.validateGrid(invalidGrid, 4)
      expect(isValid).toBe(false)
    })
  })

  describe('isPuzzleComplete', () => {
    it('should return true for complete puzzle', () => {
      const solution = [
        [1, 2, 3, 4],
        [3, 4, 1, 2],
        [2, 1, 4, 3],
        [4, 3, 2, 1]
      ]

      const isComplete = SudokuService.isPuzzleComplete(solution, solution)
      expect(isComplete).toBe(true)
    })

    it('should return false for incomplete puzzle', () => {
      const solution = [
        [1, 2, 3, 4],
        [3, 4, 1, 2],
        [2, 1, 4, 3],
        [4, 3, 2, 1]
      ]

      const incomplete = [
        [1, 0, 3, 4],
        [3, 4, 1, 2],
        [2, 1, 4, 3],
        [4, 3, 2, 1]
      ]

      const isComplete = SudokuService.isPuzzleComplete(incomplete, solution)
      expect(isComplete).toBe(false)
    })
  })
})