import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { RiddleService } from "@/services/RiddleService"
import { Difficulty } from "@/types/question"

// GET /api/riddles - Get random riddle
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const difficulty = searchParams.get("difficulty") as Difficulty || undefined

    const riddle = await RiddleService.getRandomRiddle(difficulty)

    return NextResponse.json({ riddle })
  } catch (error) {
    console.error("Error fetching riddle:", error)
    return NextResponse.json({ error: "Failed to fetch riddle" }, { status: 500 })
  }
}