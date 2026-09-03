import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { SudokuService } from "@/services/SudokuService"

// POST /api/sudoku/session - Start a Sudoku game session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const userId = (session.user as any).id

    const gameSession = await SudokuService.startSession(body.sudokuId, userId)

    return NextResponse.json({ session: gameSession }, { status: 201 })
  } catch (error) {
    console.error("Error starting Sudoku session:", error)
    return NextResponse.json({ error: "Failed to start Sudoku session" }, { status: 500 })
  }
}