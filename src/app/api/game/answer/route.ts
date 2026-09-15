import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { GameService } from "@/services/GameService"

// POST /api/game/answer - Submit an answer
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const result = await GameService.submitAnswer({
      gameSessionId: body.gameSessionId,
      questionId: body.questionId,
      answer: body.answer,
      responseTime: body.responseTime
    })

    return NextResponse.json({ result })
  } catch (error) {
    console.error("Error submitting answer:", error)
    return NextResponse.json({ error: "Failed to submit answer" }, { status: 500 })
  }
}