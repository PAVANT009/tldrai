import { NextRequest, NextResponse } from "next/server"
import pdf from "pdf-parse/lib/pdf-parse.js"
import { requireCurrentUserId } from "@/lib/server-auth"
import { toApiErrorResponse } from "@/lib/api-error"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    await requireCurrentUserId()

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file found" },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const result = await pdf(buffer)

    return NextResponse.json({ text: result.text })

  } catch (error) {
    return toApiErrorResponse(error)
  }
}
