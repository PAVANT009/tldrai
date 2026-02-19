import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { Category } from "@/lib/models/category";
import { getCurrentUserId } from "@/lib/server-auth";
import { toApiErrorResponse } from "@/lib/api-error";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    await connectToDatabase();
    const userId = await getCurrentUserId();
    const { categoryId } = await params;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return badRequest("Invalid category id");
    }

    const category = await Category.findOne({ _id: categoryId, userId });
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const nextName = typeof body?.name === "string" ? body.name : "";

    if (!nextName) {
      return badRequest("Category name is required");
    }

    category.name = nextName;
    await category.save();

    return NextResponse.json({
      category: {
        id: category._id.toString(),
        name: category.name,
        updatedAt: category.updatedAt,
      },
    });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    await connectToDatabase();
    const userId = await getCurrentUserId();
    const { categoryId } = await params;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return badRequest("Invalid category id");
    }

    const category = await Category.findOneAndDelete({ _id: categoryId, userId });
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
