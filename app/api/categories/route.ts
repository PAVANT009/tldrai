import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Category } from "@/lib/models/category";
import { requireCurrentUserId } from "@/lib/server-auth";
import { toApiErrorResponse } from "@/lib/api-error";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
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
    // const userId = "123"

    const body = await request.json().catch(() => ({}));
    const name = typeof body?.name === "string" ? body.name : "";

    if (!name) {
      return badRequest("Category name is required");
    }

    const category = await Category.create({
      userId,
      name,
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
    return toApiErrorResponse(error);
  }
}
