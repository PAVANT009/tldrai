import { NextRequest, NextResponse } from "next/server";
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

export async function GET() {
  try {
    await connectToDatabase();
    const userId = await requireCurrentUserId();

    const categories = await Category.find({ userId })
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({
      categories: categories.map((category) => ({
        id: category._id.toString(),
        name: category.name,
        updatedAt: category.updatedAt,
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
    const { name, nameKey } = normalizeCategoryName(body?.name);

    if (!name) {
      return badRequest("Category name is required");
    }

    const existingCategory = await Category.findOne({
      userId,
      $or: [
        { nameKey },
        { name: { $regex: `^${escapeRegex(name)}$`, $options: "i" } },
      ],
    }).lean();
    if (existingCategory) {
      return conflict("Category with this name already exists");
    }

    const category = await Category.create({
      userId,
      name,
      nameKey,
    });

    return NextResponse.json(
      {
        category: {
          id: category._id.toString(),
          name: category.name,
          updatedAt: category.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return conflict("Category with this name already exists");
    }
    return toApiErrorResponse(error);
  }
}
