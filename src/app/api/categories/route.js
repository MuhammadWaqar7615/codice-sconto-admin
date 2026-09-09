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

function serializeCategory(c) {
  return {
    ...c,
    _id: c.id,
    status: c.status ? c.status.toLowerCase() : "enabled",
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const showInMenu = searchParams.get("showInMenu");
    const where = {};

    if (["enabled", "disabled"].includes(status?.toLowerCase())) {
      where.status = status.toUpperCase();
    }
    if (showInMenu === "true" || showInMenu === "false") {
      where.showInMenu = showInMenu === "true";
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: { title: "asc" },
    });

    return NextResponse.json({
      categories: categories.map(serializeCategory),
    });
  } catch (error) {
    console.error("GET /api/categories Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authError = await requireAdmin();
    if (authError) return NextResponse.json({ message: authError.message }, { status: authError.status });

    const body = await request.json();
    if (!body.title?.trim()) {
      return NextResponse.json({ message: "Title is required." }, { status: 400 });
    }

    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });
    if (existingCategory) {
      return NextResponse.json({ message: "Category with this slug already exists." }, { status: 409 });
    }

    const category = await prisma.category.create({
      data: {
        title: body.title,
        slug,
        description: body.description || null,
        icon: body.icon || null,
        showInMenu: body.showInMenu !== undefined ? Boolean(body.showInMenu) : true,
        featured: body.featured !== undefined ? Boolean(body.featured) : false,
        seoTitle: body.seoTitle || null,
        seoDescription: body.seoDescription || null,
        status: (body.status || "enabled").toUpperCase() === "DISABLED" ? "DISABLED" : "ENABLED",
        image: body.image || "/images/placeholder.png",
        imagePublicId: body.imagePublicId || null,
        imageStoragePath: body.imageStoragePath || body.imagePublicId || null,
      },
    });

    return NextResponse.json({ category: serializeCategory(category) }, { status: 201 });
  } catch (error) {
    console.error("POST /api/categories Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
