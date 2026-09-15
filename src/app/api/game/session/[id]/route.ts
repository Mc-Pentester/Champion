import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { GameService } from "@/services/GameService"
import { ScoringService } from "@/services/ScoringService"

// GET /api/game/session/[id] - Get a specific game session
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const session = await getServerSession(authOptions as any)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session as any).user.id
    const gameSession = await GameService.getSession(params.id)

    if (!gameSession) {
      return NextResponse.json({ error: "Game session not found" }, { status: 404 })
    }

    // Check if user owns this session
    if (gameSession.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Calculate stats for the session
    const stats = await ScoringService.calculateGameScore(params.id)

    return NextResponse.json({ 
      result: {
        gameSession,
        stats
      }
    })
  } catch (error) {
    console.error("Error fetching game session:", error)
    return NextResponse.json({ error: "Failed to fetch game session" }, { status: 500 })
  }
}

// POST /api/game/session/[id] - Complete a game session
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const session = await getServerSession(authOptions as any)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session as any).user.id
    const gameSession = await GameService.getSession(params.id)

    if (!gameSession) {
      return NextResponse.json({ error: "Game session not found" }, { status: 404 })
    }

    if (gameSession.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const result = await GameService.completeSession(params.id)

    console.log("Complete session result:", JSON.stringify(result, null, 2))

    return NextResponse.json({ result })
  } catch (error) {
    console.error("Error completing game session:", error)
    return NextResponse.json({ error: "Failed to complete game session" }, { status: 500 })
  }
}

// DELETE /api/game/session/[id] - Abandon a game session
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const session = await getServerSession(authOptions as any)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session as any).user.id
    const gameSession = await GameService.getSession(params.id)

    if (!gameSession) {
      return NextResponse.json({ error: "Game session not found" }, { status: 404 })
    }

    if (gameSession.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await GameService.abandonSession(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error abandoning game session:", error)
    return NextResponse.json({ error: "Failed to abandon game session" }, { status: 500 })
  }
}