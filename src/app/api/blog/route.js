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

function serializePost(p) {
  return {
    ...p,
    _id: p.id,
    status: p.status ? p.status.toLowerCase() : "enabled",
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const where = {};
    if (["enabled", "disabled"].includes(status?.toLowerCase())) {
      where.status = status.toUpperCase();
    }

    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ posts: posts.map(serializePost) });
  } catch (error) {
    console.error("GET /api/blog Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authError = await requireAdmin();
    if (authError) return NextResponse.json({ message: authError.message }, { status: authError.status });

    const body = await request.json();
    if (!body.title?.trim() || !body.description?.trim() || !body.image?.trim()) {
      return NextResponse.json({ message: "Title, description, and image are required." }, { status: 400 });
    }

    const post = await prisma.blogPost.create({
      data: {
        title: body.title,
        description: body.description,
        seoTitle: body.seoTitle || null,
        seoDescription: body.seoDescription || null,
        image: body.image,
        imagePublicId: body.imagePublicId || null,
        imageStoragePath: body.imageStoragePath || body.imagePublicId || null,
        status: (body.status || "enabled").toUpperCase() === "DISABLED" ? "DISABLED" : "ENABLED",
      },
    });

    return NextResponse.json({ post: serializePost(post) }, { status: 201 });
  } catch (error) {
    console.error("POST /api/blog Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
