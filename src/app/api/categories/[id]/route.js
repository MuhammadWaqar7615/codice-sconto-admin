import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { deleteFromSupabase } from "@/lib/supabase";

async function requireAdmin() {
  const session = await getSession();
  if (!session?.user) return { message: "Unauthorized", status: 401 };
  const role = (session.user.role || "").toLowerCase();
  if (role !== ROLES.ADMIN && role !== ROLES.ADMINISTRATION) return { message: "Forbidden", status: 403 };
  return null;
}

function serializeCategory(c) {
  return {
    ...c,
    _id: c.id,
    status: c.status ? c.status.toLowerCase() : "enabled",
  };
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const category = await prisma.category.findUnique({
      where: { id },
    });
    if (!category) return NextResponse.json({ message: "Category not found" }, { status: 404 });
    return NextResponse.json({ category: serializeCategory(category) });
  } catch (error) {
    console.error("GET /api/categories/[id] Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const authError = await requireAdmin();
    if (authError) return NextResponse.json({ message: authError.message }, { status: authError.status });
    const { id } = await params;

    const currentCategory = await prisma.category.findUnique({
      where: { id },
    });
    if (!currentCategory) return NextResponse.json({ message: "Category not found" }, { status: 404 });

    const body = await request.json();

    // Check if image changed and delete old image from Supabase
    const oldPath = currentCategory.imageStoragePath || currentCategory.imagePublicId;
    const newPath = body.imageStoragePath || body.imagePublicId;
    if (oldPath && newPath && oldPath !== newPath) {
      await deleteFromSupabase("store-images", oldPath);
    }

    const updateData = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.description !== undefined) updateData.description = body.description || null;
    if (body.icon !== undefined) updateData.icon = body.icon || null;
    if (body.showInMenu !== undefined) updateData.showInMenu = Boolean(body.showInMenu);
    if (body.featured !== undefined) updateData.featured = Boolean(body.featured);
    if (body.seoTitle !== undefined) updateData.seoTitle = body.seoTitle || null;
    if (body.seoDescription !== undefined) updateData.seoDescription = body.seoDescription || null;
    if (body.status !== undefined) {
      updateData.status = (body.status || "enabled").toUpperCase() === "DISABLED" ? "DISABLED" : "ENABLED";
    }
    if (body.image !== undefined) updateData.image = body.image;
    if (newPath !== undefined) {
      updateData.imagePublicId = body.imagePublicId || null;
      updateData.imageStoragePath = newPath || null;
    }

    const updated = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ category: serializeCategory(updated) });
  } catch (error) {
    console.error("PUT /api/categories/[id] Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const authError = await requireAdmin();
    if (authError) return NextResponse.json({ message: authError.message }, { status: authError.status });
    const { id } = await params;

    const categoryToDelete = await prisma.category.findUnique({
      where: { id },
    });
    if (!categoryToDelete) return NextResponse.json({ message: "Category not found" }, { status: 404 });

    const path = categoryToDelete.imageStoragePath || categoryToDelete.imagePublicId;
    if (path) {
      await deleteFromSupabase("store-images", path);
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/categories/[id] Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
