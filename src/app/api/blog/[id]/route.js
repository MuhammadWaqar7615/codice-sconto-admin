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

function serializePost(p) {
  return {
    ...p,
    _id: p.id,
    status: p.status ? p.status.toLowerCase() : "enabled",
  };
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const post = await prisma.blogPost.findUnique({
      where: { id },
    });
    if (!post) return NextResponse.json({ message: "Blog post not found" }, { status: 404 });
    return NextResponse.json({ post: serializePost(post) });
  } catch (error) {
    console.error("GET /api/blog/[id] Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const authError = await requireAdmin();
    if (authError) return NextResponse.json({ message: authError.message }, { status: authError.status });
    const { id } = await params;
    const body = await request.json();
    if (!body.title?.trim() || !body.description?.trim() || !body.image?.trim()) {
      return NextResponse.json({ message: "Title, description, and image are required." }, { status: 400 });
    }

    const currentPost = await prisma.blogPost.findUnique({
      where: { id },
    });
    if (!currentPost) return NextResponse.json({ message: "Blog post not found" }, { status: 404 });

    const oldPath = currentPost.imageStoragePath || currentPost.imagePublicId;
    const newPath = body.imageStoragePath || body.imagePublicId;
    if (oldPath && newPath && oldPath !== newPath) {
      await deleteFromSupabase("store-images", oldPath);
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        seoTitle: body.seoTitle || null,
        seoDescription: body.seoDescription || null,
        image: body.image,
        imagePublicId: body.imagePublicId || null,
        imageStoragePath: newPath || null,
        status: (body.status || "enabled").toUpperCase() === "DISABLED" ? "DISABLED" : "ENABLED",
      },
    });

    return NextResponse.json({ post: serializePost(post) });
  } catch (error) {
    console.error("PUT /api/blog/[id] Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const authError = await requireAdmin();
    if (authError) return NextResponse.json({ message: authError.message }, { status: authError.status });
    const { id } = await params;

    const postToDelete = await prisma.blogPost.findUnique({
      where: { id },
    });
    if (!postToDelete) return NextResponse.json({ message: "Blog post not found" }, { status: 404 });

    const path = postToDelete.imageStoragePath || postToDelete.imagePublicId;
    if (path) {
      await deleteFromSupabase("store-images", path);
    }

    await prisma.blogPost.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Blog post deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/blog/[id] Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
