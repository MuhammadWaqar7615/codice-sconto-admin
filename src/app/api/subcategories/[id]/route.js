import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";

async function requireAdmin() {
  const session = await getSession();
  if (!session?.user) return { message: "Unauthorized", status: 401 };
  const role = (session.user.role || "").toLowerCase();
  if (role !== ROLES.ADMIN && role !== ROLES.ADMINISTRATION) return { message: "Forbidden", status: 403 };
  return null;
}

function serializeSubcategory(s) {
  return {
    ...s,
    _id: s.id,
    status: s.status ? s.status.toLowerCase() : "enabled",
    parentCategory: s.parentCategory ? { ...s.parentCategory, _id: s.parentCategory.id } : s.parentCategoryId,
    parentCategoryId: s.parentCategoryId,
  };
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const subcategory = await prisma.subcategory.findUnique({
      where: { id },
      include: {
        parentCategory: { select: { id: true, title: true } },
      },
    });

    if (!subcategory) return NextResponse.json({ message: "Subcategory not found" }, { status: 404 });
    return NextResponse.json({ subcategory: serializeSubcategory(subcategory) });
  } catch (error) {
    console.error("GET /api/subcategories/[id] Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const authError = await requireAdmin();
    if (authError) return NextResponse.json({ message: authError.message }, { status: authError.status });
    const { id } = await params;

    const currentSub = await prisma.subcategory.findUnique({
      where: { id },
    });
    if (!currentSub) return NextResponse.json({ message: "Subcategory not found" }, { status: 404 });

    const body = await request.json();
    if (!body.title?.trim()) return NextResponse.json({ message: "Title is required." }, { status: 400 });

    const parentId = body.parentCategoryId || body.parentCategory;
    if (parentId) {
      const parentExists = await prisma.category.findUnique({
        where: { id: parentId },
      });
      if (!parentExists) {
        return NextResponse.json({ message: "A valid parent category is required." }, { status: 400 });
      }
    }

    const updateData = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.description !== undefined) updateData.description = body.description || null;
    if (parentId !== undefined) updateData.parentCategoryId = parentId;
    if (body.seoTitle !== undefined) updateData.seoTitle = body.seoTitle || null;
    if (body.seoDescription !== undefined) updateData.seoDescription = body.seoDescription || null;
    if (body.status !== undefined) {
      updateData.status = (body.status || "enabled").toUpperCase() === "DISABLED" ? "DISABLED" : "ENABLED";
    }

    const subcategory = await prisma.subcategory.update({
      where: { id },
      data: updateData,
      include: {
        parentCategory: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({ subcategory: serializeSubcategory(subcategory) });
  } catch (error) {
    console.error("PUT /api/subcategories/[id] Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const authError = await requireAdmin();
    if (authError) return NextResponse.json({ message: authError.message }, { status: authError.status });
    const { id } = await params;

    const subcategory = await prisma.subcategory.findUnique({
      where: { id },
    });
    if (!subcategory) return NextResponse.json({ message: "Subcategory not found" }, { status: 404 });

    await prisma.subcategory.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Subcategory deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/subcategories/[id] Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
