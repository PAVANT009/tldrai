import { NextRequest, NextResponse } from "next/server"
import pdf from "pdf-parse/lib/pdf-parse.js"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
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
    console.error("PDF Parse Error:", error)
    return NextResponse.json(
      { error: "Failed to parse PDF" },
      { status: 500 }
    )
  }
}
