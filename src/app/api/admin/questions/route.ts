import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { QuestionBankService } from "@/services/QuestionBankService"
import { QuestionSource, QuestionStatus, Difficulty, Language, QuestionType } from "@/types/question"

// GET /api/admin/questions - Get all questions with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)
    
    if (!session || (session as any).user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const filter = {
      category: searchParams.get("category") || undefined,
      subcategory: searchParams.get("subcategory") || undefined,
      difficulty: searchParams.get("difficulty") as Difficulty || undefined,
      language: searchParams.get("language") as Language || undefined,
      type: searchParams.get("type") as QuestionType || undefined,
      status: searchParams.get("status") as QuestionStatus || undefined,
      source: searchParams.get("source") as QuestionSource || undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
      offset: searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : undefined
    }

    const questions = await QuestionBankService.getQuestions(filter)
    
    return NextResponse.json({ questions })
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}

// POST /api/admin/questions - Create a new question
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)
    
    if (!session || (session as any).user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const userId = (session as any).user.id

    const question = await QuestionBankService.createQuestion(
      {
        type: body.type,
        category: body.category,
        subcategory: body.subcategory,
        difficulty: body.difficulty,
        language: body.language,
        questionText: body.questionText,
        explanation: body.explanation,
        points: body.points,
        timeLimit: body.timeLimit,
        options: body.options
      },
      userId,
      body.source || QuestionSource.MANUAL
    )

    return NextResponse.json({ question }, { status: 201 })
  } catch (error) {
    console.error("Error creating question:", error)
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 })
  }
}