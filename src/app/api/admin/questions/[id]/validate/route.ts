import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { QuestionBankService } from "@/services/QuestionBankService"

// POST /api/admin/questions/[id]/validate - Validate or reject a question
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatorId = (session.user as any).id

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