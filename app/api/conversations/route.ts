import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Conversation } from "@/lib/models/conversation";
import { getCurrentUserId } from "@/lib/server-auth";

export async function GET() {
  await connectToDatabase();
  const userId = await getCurrentUserId();

  const conversations = await Conversation.find({ userId })
    .sort({ updatedAt: -1 })
    .lean();

  return NextResponse.json({
    conversations: conversations.map((c) => ({
      id: c._id.toString(),
      title: c.title,
      lastMessage: c.lastMessage || "",
      updatedAt: c.updatedAt,
    })),
  });
}

export async function POST(request: NextRequest) {
  await connectToDatabase();
  const userId = await getCurrentUserId();

  const body = await request.json().catch(() => ({}));
  const requestedTitle =
    typeof body?.title === "string" ? body.title.trim() : "";

  const conversation = await Conversation.create({
    userId,
    title: requestedTitle || "New Chat",
    lastMessage: "",
  });

  return NextResponse.json(
    {
      conversation: {
        id: conversation._id.toString(),
        title: conversation.title,
        updatedAt: conversation.updatedAt,
      },
    },
    { status: 201 }
  );
}
