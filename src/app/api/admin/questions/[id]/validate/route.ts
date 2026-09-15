import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { QuestionBankService } from "@/services/QuestionBankService"

// POST /api/admin/questions/[id]/validate - Validate or reject a question
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const session = await getServerSession(authOptions as any)
    
    if (!session || (session as any).user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatorId = (session as any).user.id

    const question = await QuestionBankService.validateQuestion(
      params.id,
      validatorId,
      body.approved
    )

    return NextResponse.json({ question })
  } catch (error) {
    console.error("Error validating question:", error)
    return NextResponse.json({ error: "Failed to validate question" }, { status: 500 })
  }
}