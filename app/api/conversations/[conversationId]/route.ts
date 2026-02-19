import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { Conversation } from "@/lib/models/conversation";
import { ChatMessage } from "@/lib/models/chat-message";
import { Category } from "@/lib/models/category";
import { requireCurrentUserId } from "@/lib/server-auth";
import { toApiErrorResponse } from "@/lib/api-error";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

type PopulatedCategory = {
  _id: mongoose.Types.ObjectId;
  name: string;
} | null;

function getCategoryId(value: unknown) {
  if (!value) return null;
  if (value instanceof mongoose.Types.ObjectId) {
    return value.toString();
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "_id" in value &&
    (value as { _id?: unknown })._id instanceof mongoose.Types.ObjectId
  ) {
    return (value as { _id: mongoose.Types.ObjectId })._id.toString();
  }
  return null;
}

function mapCategory(value: unknown) {
  if (
    !value ||
    typeof value !== "object" ||
    !("_id" in value) ||
    !("name" in value) ||
    !((value as { _id?: unknown })._id instanceof mongoose.Types.ObjectId) ||
    typeof (value as { name?: unknown }).name !== "string"
  ) {
    return null;
  }
  const category = value as NonNullable<PopulatedCategory>;
  return {
    id: category._id.toString(),
    name: category.name,
  };
}

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    await connectToDatabase();
    const userId = await requireCurrentUserId();
    const { conversationId } = await params;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return badRequest("Invalid conversation id");
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId,
    })
      .populate("categoryId", "name")
      .lean();
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
        categoryId: getCategoryId(conversation.categoryId),
        category: mapCategory(conversation.categoryId),
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
    const userId = await requireCurrentUserId();
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
    await conversation.populate("categoryId", "name");

    return NextResponse.json({
      conversation: {
        id: conversation._id.toString(),
        title: conversation.title,
        lastMessage: conversation.lastMessage || "",
        categoryId: getCategoryId(conversation.categoryId),
        category: mapCategory(conversation.categoryId),
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
    const userId = await requireCurrentUserId();
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
