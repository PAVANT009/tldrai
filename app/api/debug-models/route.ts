// app/api/debug-models/route.ts
import { NextResponse } from "next/server";
import { requireCurrentUserId } from "@/lib/server-auth";
import { toApiErrorResponse } from "@/lib/api-error";

export async function GET() {
  try {
    await requireCurrentUserId();

    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!key) {
      return NextResponse.json({ error: "API Key missing in env" }, { status: 500 });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    const response = await fetch(url);
    const data = await response.json();

    console.dir(data, { depth: null });

    return NextResponse.json(data);
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
