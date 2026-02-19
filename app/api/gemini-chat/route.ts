import { NextRequest, NextResponse } from "next/server";
import { summarizePdfWithGemini } from "@/lib/gemini";
import { requireCurrentUserId } from "@/lib/server-auth";
import { toApiErrorResponse } from "@/lib/api-error";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await requireCurrentUserId();

    const body = (await request.json().catch(() => null)) ?? {};
    const pdfText =
      typeof body?.pdfText === "string" ? body.pdfText.trim() : "";
    const question =
      typeof body?.question === "string" ? body.question.trim() : "";

    if (!pdfText) {
      return NextResponse.json(
        { error: "PDF text is required for summarization" },
        { status: 400 }
      );
    }

    if (!question) {
      return NextResponse.json(
        { error: "Question is required for summarization" },
        { status: 400 }
      );
    }

    const summary = await summarizePdfWithGemini(pdfText, question);
    return NextResponse.json({ summary });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
