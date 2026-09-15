import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { GameService } from "@/services/GameService"
import { GameType } from "@/types/question"

// POST /api/game/session - Create a new game session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const userId = (session as any).user.id

    const gameSession = await GameService.createSession({
      userId,
      gameType: body.gameType as GameType,
      quizId: body.quizId
    })

    return NextResponse.json({ gameSession }, { status: 201 })
  } catch (error) {
    console.error("Error creating game session:", error)
    return NextResponse.json({ error: "Failed to create game session" }, { status: 500 })
  }
}

// GET /api/game/session - Get active session for user
export async function GET() {
  try {
    const session = await getServerSession(authOptions as any)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session as any).user.id
    const activeSession = await GameService.getActiveSession(userId)

    return NextResponse.json({ session: activeSession })
  } catch (error) {
    console.error("Error fetching active session:", error)
    return NextResponse.json({ error: "Failed to fetch active session" }, { status: 500 })
  }
}