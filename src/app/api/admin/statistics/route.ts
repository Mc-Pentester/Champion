import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { QuestionBankService } from "@/services/QuestionBankService"

// GET /api/admin/statistics - Get admin statistics
export async function GET() {
  try {
    const session = await getServerSession(authOptions as any)
    
    if (!session || (session as any).user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const stats = await QuestionBankService.getStatistics()
    
    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Error fetching statistics:", error)
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 })
  }
}