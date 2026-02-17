import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { Conversation } from "@/lib/models/conversation";
import { ChatMessage } from "@/lib/models/chat-message";
import { Category } from "@/lib/models/category";
import { getCurrentUserId } from "@/lib/server-auth";
import { toApiErrorResponse } from "@/lib/api-error";

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
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const messageCount = await ChatMessage.countDocuments({
      conversationId: conversation._id,
      userId,
    });

    return NextResponse.json({
      conversation: {
        id: conversation._id.toString(),
        title: conversation.title,
        lastMessage: conversation.lastMessage || "",
        categoryId: conversation.categoryId
          ? conversation.categoryId.toString()
          : null,
        messageCount,
        updatedAt: conversation.updatedAt,
        createdAt: conversation.createdAt,
      },
    });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}

export async function PATCH(
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

    const conversation = await Conversation.findOne({ _id: conversationId, userId });
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => ({}));

    if (typeof body?.title === "string") {
      const nextTitle = body.title.trim();
      if (!nextTitle) {
        return badRequest("Title cannot be empty");
      }
      conversation.title = nextTitle.slice(0, 120);
    }

    if ("categoryId" in body) {
      const requestedCategoryId =
        typeof body.categoryId === "string" ? body.categoryId : null;

      if (!requestedCategoryId) {
        conversation.categoryId = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(requestedCategoryId)) {
          return badRequest("Invalid category id");
        }

        const category = await Category.findOne({
          _id: requestedCategoryId,
          userId,
        }).lean();

        if (!category) {
          return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }

        conversation.categoryId = category._id;
      }
    }

    await conversation.save();

    return NextResponse.json({
      conversation: {
        id: conversation._id.toString(),
        title: conversation.title,
        lastMessage: conversation.lastMessage || "",
        categoryId: conversation.categoryId
          ? conversation.categoryId.toString()
          : null,
        updatedAt: conversation.updatedAt,
        createdAt: conversation.createdAt,
      },
    });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}

export async function DELETE(
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

    const conversation = await Conversation.findOneAndDelete({
      _id: conversationId,
      userId,
    });
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    await ChatMessage.deleteMany({ conversationId: conversation._id, userId });

    return NextResponse.json({ success: true });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
