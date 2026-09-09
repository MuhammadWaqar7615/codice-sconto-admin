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

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const badge = await prisma.badge.findUnique({
      where: { id },
    });
    if (!badge) return NextResponse.json({ message: "Badge not found" }, { status: 404 });
    return NextResponse.json({ badge: { ...badge, _id: badge.id } });
  } catch (error) {
    console.error("GET /api/badges/[id] Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const authError = await requireAdmin();
    if (authError) return NextResponse.json({ message: authError.message }, { status: authError.status });
    const { id } = await params;
    const body = await request.json();
    if (!body.name?.trim() || !body.image?.trim()) {
      return NextResponse.json({ message: "Name and image are required." }, { status: 400 });
    }

    const currentBadge = await prisma.badge.findUnique({
      where: { id },
    });
    if (!currentBadge) return NextResponse.json({ message: "Badge not found" }, { status: 404 });

    const oldPath = currentBadge.imageStoragePath || currentBadge.imagePublicId;
    const newPath = body.imageStoragePath || body.imagePublicId;
    if (oldPath && newPath && oldPath !== newPath) {
      await deleteFromSupabase("store-images", oldPath);
    }

    const badge = await prisma.badge.update({
      where: { id },
      data: {
        name: body.name,
        image: body.image,
        imagePublicId: body.imagePublicId || null,
        imageStoragePath: newPath || null,
      },
    });

    return NextResponse.json({ badge: { ...badge, _id: badge.id } });
  } catch (error) {
    console.error("PUT /api/badges/[id] Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const authError = await requireAdmin();
    if (authError) return NextResponse.json({ message: authError.message }, { status: authError.status });
    const { id } = await params;

    const badgeToDelete = await prisma.badge.findUnique({
      where: { id },
    });
    if (!badgeToDelete) return NextResponse.json({ message: "Badge not found" }, { status: 404 });

    const path = badgeToDelete.imageStoragePath || badgeToDelete.imagePublicId;
    if (path) {
      await deleteFromSupabase("store-images", path);
    }

    await prisma.badge.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Badge deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/badges/[id] Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
