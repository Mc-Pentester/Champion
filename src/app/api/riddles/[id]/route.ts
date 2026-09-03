import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { RiddleService } from "@/services/RiddleService"

// GET /api/riddles/[id] - Get a specific riddle
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const riddle = await RiddleService.getRiddleById(params.id)
    
    if (!riddle) {
      return NextResponse.json({ error: "Riddle not found" }, { status: 404 })
    }

    return NextResponse.json({ riddle })
  } catch (error) {
    console.error("Error fetching riddle:", error)
    return NextResponse.json({ error: "Failed to fetch riddle" }, { status: 500 })
  }
}

// POST /api/riddles/[id]/check - Check riddle answer
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const result = await RiddleService.checkAnswer(
      params.id,
      body.answer,
      body.hintsUsed || 0
    )

    return NextResponse.json({ result })
  } catch (error) {
    console.error("Error checking riddle answer:", error)
    return NextResponse.json({ error: "Failed to check answer" }, { status: 500 })
  }
}