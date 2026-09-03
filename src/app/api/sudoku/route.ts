import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { SudokuService } from "@/services/SudokuService"
import { SudokuSize, Difficulty } from "@/types/question"

// GET /api/sudoku - Get random Sudoku puzzle
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const size = searchParams.get("size") as SudokuSize || undefined
    const difficulty = searchParams.get("difficulty") as Difficulty || undefined

    const sudoku = await SudokuService.getRandomPuzzle(size, difficulty)

    return NextResponse.json({ sudoku })
  } catch (error) {
    console.error("Error fetching Sudoku:", error)
    return NextResponse.json({ error: "Failed to fetch Sudoku" }, { status: 500 })
  }
}