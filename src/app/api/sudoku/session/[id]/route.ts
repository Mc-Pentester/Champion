import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { SudokuService } from "@/services/SudokuService"

// GET /api/sudoku/session/[id] - Get Sudoku session
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const gameSession = await SudokuService.getSession(params.id)

    if (!gameSession) {
      return NextResponse.json({ error: "Sudoku session not found" }, { status: 404 })
    }

    if (gameSession.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({ session: gameSession })
  } catch (error) {
    console.error("Error fetching Sudoku session:", error)
    return NextResponse.json({ error: "Failed to fetch Sudoku session" }, { status: 500 })
  }
}

// POST /api/sudoku/session/[id]/move - Make a move in Sudoku
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const gameSession = await SudokuService.getSession(params.id)

    if (!gameSession) {
      return NextResponse.json({ error: "Sudoku session not found" }, { status: 404 })
    }

    if (gameSession.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()

    const result = await SudokuService.makeMove(params.id, {
      row: body.row,
      col: body.col,
      value: body.value
    })

    return NextResponse.json({ result })
  } catch (error) {
    console.error("Error making Sudoku move:", error)
    return NextResponse.json({ error: "Failed to make move" }, { status: 500 })
  }
}

// DELETE /api/sudoku/session/[id] - Abandon Sudoku session
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const gameSession = await SudokuService.getSession(params.id)

    if (!gameSession) {
      return NextResponse.json({ error: "Sudoku session not found" }, { status: 404 })
    }

    if (gameSession.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await SudokuService.abandonSession(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error abandoning Sudoku session:", error)
    return NextResponse.json({ error: "Failed to abandon session" }, { status: 500 })
  }
}