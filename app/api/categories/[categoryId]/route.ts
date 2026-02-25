import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { Category } from "@/lib/models/category";
import { requireCurrentUserId } from "@/lib/server-auth";
import { toApiErrorResponse } from "@/lib/api-error";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function conflict(message: string) {
  return NextResponse.json({ error: message }, { status: 409 });
}

function normalizeCategoryName(value: unknown) {
  if (typeof value !== "string") return { name: "", nameKey: "" };
  const name = value.trim();
  return { name, nameKey: name.toLowerCase() };
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isDuplicateKeyError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === 11000
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    await connectToDatabase();
    const userId = await requireCurrentUserId();
    const { categoryId } = await params;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return badRequest("Invalid category id");
    }

    const category = await Category.findOne({ _id: categoryId, userId });
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const { name: nextName, nameKey: nextNameKey } = normalizeCategoryName(
      body?.name
    );

    if (!nextName) {
      return badRequest("Category name is required");
    }

    const existingCategory = await Category.findOne({
      userId,
      _id: { $ne: category._id },
      $or: [
        { nameKey: nextNameKey },
        { name: { $regex: `^${escapeRegex(nextName)}$`, $options: "i" } },
      ],
    }).lean();
    if (existingCategory) {
      return conflict("Category with this name already exists");
    }

    category.name = nextName;
    category.nameKey = nextNameKey;
    await category.save();

    return NextResponse.json({
      category: {
        id: category._id.toString(),
        name: category.name,
        updatedAt: category.updatedAt,
      },
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return conflict("Category with this name already exists");
    }
    return toApiErrorResponse(error);
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    await connectToDatabase();
    const userId = await requireCurrentUserId();
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
