import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { GameService } from "@/services/GameService"

// GET /api/game/session/[id] - Get a specific game session
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
    const gameSession = await GameService.getSession(params.id)

    if (!gameSession) {
      return NextResponse.json({ error: "Game session not found" }, { status: 404 })
    }

    // Check if user owns this session
    if (gameSession.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({ session: gameSession })
  } catch (error) {
    console.error("Error fetching game session:", error)
    return NextResponse.json({ error: "Failed to fetch game session" }, { status: 500 })
  }
}

// POST /api/game/session/[id]/complete - Complete a game session
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
    const gameSession = await GameService.getSession(params.id)

    if (!gameSession) {
      return NextResponse.json({ error: "Game session not found" }, { status: 404 })
    }

    if (gameSession.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const result = await GameService.completeSession(params.id)

    return NextResponse.json({ result })
  } catch (error) {
    console.error("Error completing game session:", error)
    return NextResponse.json({ error: "Failed to complete game session" }, { status: 500 })
  }
}

// DELETE /api/game/session/[id] - Abandon a game session
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