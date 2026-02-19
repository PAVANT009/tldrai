import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { Conversation } from "@/lib/models/conversation";
import { Category } from "@/lib/models/category";
import { requireCurrentUserId } from "@/lib/server-auth";
import { toApiErrorResponse } from "@/lib/api-error";

type CategoryValue = {
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
  const category = value as NonNullable<CategoryValue>;
  return {
    id: category._id.toString(),
    name: category.name,
  };
}

export async function GET() {
  try {
    await connectToDatabase();
    const userId = await requireCurrentUserId();

    const conversations = await Conversation.find({ userId })
      .populate("categoryId", "name")
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({
      conversations: conversations.map((c) => ({
        id: c._id.toString(),
        title: c.title,
        lastMessage: c.lastMessage || "",
        categoryId: getCategoryId(c.categoryId),
        category: mapCategory(c.categoryId),
        updatedAt: c.updatedAt,
      })),
    });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const userId = await requireCurrentUserId();

    const body = await request.json().catch(() => ({}));
    const requestedTitle =
      typeof body?.title === "string" ? body.title.trim() : "";
    const categoryId =
      typeof body?.categoryId === "string" ? body.categoryId : null;

    let resolvedCategoryId: string | null = null;

    if (categoryId) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return NextResponse.json({ error: "Invalid category id" }, { status: 400 });
      }

      const category = await Category.findOne({ _id: categoryId, userId }).lean();
      if (!category) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
      resolvedCategoryId = categoryId;
    }

    const conversation = await Conversation.create({
      userId,
      title: requestedTitle || "New Chat",
      lastMessage: "",
      categoryId: resolvedCategoryId,
    });
    await conversation.populate("categoryId", "name");

    return NextResponse.json(
      {
        conversation: {
          id: conversation._id.toString(),
          title: conversation.title,
          categoryId: getCategoryId(conversation.categoryId),
          category: mapCategory(conversation.categoryId),
          updatedAt: conversation.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
