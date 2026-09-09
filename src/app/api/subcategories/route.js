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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const parentCategory = searchParams.get("parentCategory");
    const where = {};

    if (["enabled", "disabled"].includes(status?.toLowerCase())) {
      where.status = status.toUpperCase();
    }
    if (parentCategory) {
      where.parentCategoryId = parentCategory;
    }

    const subcategories = await prisma.subcategory.findMany({
      where,
      include: {
        parentCategory: { select: { id: true, title: true } },
      },
      orderBy: { title: "asc" },
    });

    return NextResponse.json({
      subcategories: subcategories.map(serializeSubcategory),
    });
  } catch (error) {
    console.error("GET /api/subcategories Error:", error);
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

    const parentId = body.parentCategoryId || body.parentCategory;
    if (!parentId) {
      return NextResponse.json({ message: "A valid parent category is required." }, { status: 400 });
    }

    const parentExists = await prisma.category.findUnique({
      where: { id: parentId },
    });
    if (!parentExists) {
      return NextResponse.json({ message: "Parent category not found." }, { status: 400 });
    }

    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const existingSub = await prisma.subcategory.findUnique({
      where: { slug },
    });
    if (existingSub) {
      return NextResponse.json({ message: "Subcategory with this slug already exists." }, { status: 409 });
    }

    const subcategory = await prisma.subcategory.create({
      data: {
        title: body.title,
        slug,
        description: body.description || null,
        parentCategoryId: parentId,
        seoTitle: body.seoTitle || null,
        seoDescription: body.seoDescription || null,
        status: (body.status || "enabled").toUpperCase() === "DISABLED" ? "DISABLED" : "ENABLED",
      },
      include: {
        parentCategory: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({ subcategory: serializeSubcategory(subcategory) }, { status: 201 });
  } catch (error) {
    console.error("POST /api/subcategories Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
