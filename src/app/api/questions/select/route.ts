import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { QuestionSelectionService } from "@/services/QuestionSelectionService"
import { Difficulty, Language } from "@/types/question"

// POST /api/questions/select - Select questions for a game
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Get recently played questions to avoid repetition
    const recentAnswers = await fetch(`${process.env.NEXTAUTH_URL}/api/game/session`, {
      cache: 'no-store'
    })
    const sessionData = await recentAnswers.json()
    
    let excludeIds: string[] = []
    if (sessionData.session && sessionData.session.answers) {
      excludeIds = sessionData.session.answers.map((a: any) => a.questionId)
    }

    const questions = await QuestionSelectionService.selectQuestions({
      category: body.category,
      subcategory: body.subcategory,
      difficulty: body.difficulty as Difficulty,
      language: body.language as Language,
      numberOfQuestions: body.numberOfQuestions || 10,
      excludeIds
    })

    return NextResponse.json({ questions })
  } catch (error) {
    console.error("Error selecting questions:", error)
    return NextResponse.json({ error: "Failed to select questions" }, { status: 500 })
  }
}