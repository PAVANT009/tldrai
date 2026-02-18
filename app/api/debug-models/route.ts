// app/api/debug-models/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!key) {
    return NextResponse.json({ error: "API Key missing in env" }, { status: 500 });
  }

  // The Gemini API actually lists models at this endpoint
  // We use v1beta because it often shows more detail on available models
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Log this so you can see it in your terminal too
    console.dir(data, { depth: null });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}