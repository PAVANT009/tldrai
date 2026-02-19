import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { Conversation } from "@/lib/models/conversation";
import { ChatMessage } from "@/lib/models/chat-message";
import { getCurrentUserId } from "@/lib/server-auth";
import { toApiErrorResponse } from "@/lib/api-error";
import { normalizePdfText, summarizePdfWithGemini } from "@/lib/gemini";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    await connectToDatabase();
    const userId = await getCurrentUserId();
    const { conversationId } = await params;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return badRequest("Invalid conversation id");
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId,
    }).lean();

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const messages = await ChatMessage.find({ conversationId, userId })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      conversation: {
        id: conversation._id.toString(),
        title: conversation.title,
      },
      messages: messages.map((m) => ({
        id: m._id.toString(),
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      })),
    });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    await connectToDatabase();
    const userId = await getCurrentUserId();
    const { conversationId } = await params;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return badRequest("Invalid conversation id");
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId,
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => null);
    const content = typeof body?.content === "string" ? body.content.trim() : "";
    const role = body?.role === "assistant" ? "assistant" : "user";
    const requestPdfText =
      typeof body?.pdfText === "string" ? normalizePdfText(body.pdfText) : "";

    if (!content) {
      return badRequest("Message content is required");
    }

    const message = await ChatMessage.create({
      conversationId,
      userId,
      role,
      content,
    });

    const title =
      conversation.title === "New Chat" && role === "user"
        ? content.slice(0, 60)
        : conversation.title;

    let assistantPayload: {
      id: string;
      role: "assistant";
      content: string;
      createdAt: Date;
    } | null = null;

    if (requestPdfText) {
      conversation.pdfText = requestPdfText;
    }

    if (role === "user") {
      const activePdfText = requestPdfText || conversation.pdfText || "";

      if (activePdfText) {
        try {
          const summary = await summarizePdfWithGemini(activePdfText, content);
          const assistantMessage = await ChatMessage.create({
            conversationId,
            userId,
            role: "assistant",
            content: summary,
          });

          assistantPayload = {
            id: assistantMessage._id.toString(),
            role: "assistant",
            content: assistantMessage.content,
            createdAt: assistantMessage.createdAt,
          };

          conversation.lastMessage = summary.slice(0, 120);
        } catch (error) {
          console.error("Gemini summary generation failed:", error);
          const assistantMessage = await ChatMessage.create({
            conversationId,
            userId,
            role: "assistant",
            content:
              "I could not summarize this PDF right now. Please try again in a moment.",
          });

          assistantPayload = {
            id: assistantMessage._id.toString(),
            role: "assistant",
            content: assistantMessage.content,
            createdAt: assistantMessage.createdAt,
          };

          conversation.lastMessage = assistantMessage.content.slice(0, 120);
        }
      } else {
        conversation.lastMessage = content.slice(0, 120);
      }
    } else {
      conversation.lastMessage = content.slice(0, 120);
    }

    conversation.title = title || conversation.title;
    await conversation.save();

    return NextResponse.json(
      {
        message: {
          id: message._id.toString(),
          role: message.role,
          content: message.content,
          createdAt: message.createdAt,
        },
        conversation: {
          id: conversation._id.toString(),
          title: conversation.title,
        },
        assistantMessage: assistantPayload,
      },
      { status: 201 }
    );
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
