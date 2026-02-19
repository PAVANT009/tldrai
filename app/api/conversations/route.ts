import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { Conversation } from "@/lib/models/conversation";
import { Category } from "@/lib/models/category";
import { requireCurrentUserId } from "@/lib/server-auth";
import { toApiErrorResponse } from "@/lib/api-error";

export async function GET() {
  try {
    await connectToDatabase();
    const userId = await requireCurrentUserId();

    const conversations = await Conversation.find({ userId })
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({
      conversations: conversations.map((c) => ({
        id: c._id.toString(),
        title: c.title,
        lastMessage: c.lastMessage || "",
        categoryId: c.categoryId ? c.categoryId.toString() : null,
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

    return NextResponse.json(
      {
        conversation: {
          id: conversation._id.toString(),
          title: conversation.title,
          categoryId: conversation.categoryId
            ? conversation.categoryId.toString()
            : null,
          updatedAt: conversation.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
