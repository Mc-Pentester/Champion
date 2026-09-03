import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { RiddleService } from "@/services/RiddleService"

// GET /api/riddles/[id]/hint?index=0 - Get a hint for a riddle
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const hintIndex = parseInt(searchParams.get("index") || "0")

    const hint = await RiddleService.getHint(params.id, hintIndex)

    return NextResponse.json({ hint })
  } catch (error) {
    console.error("Error fetching hint:", error)
    return NextResponse.json({ error: "Failed to fetch hint" }, { status: 500 })
  }
}