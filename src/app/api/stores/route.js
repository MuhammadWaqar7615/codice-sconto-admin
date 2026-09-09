import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get("active");
    const search = searchParams.get("search");
    const letter = searchParams.get("letter");

    let where = {};
    if (active === "true") {
      where.isActive = true;
    } else if (active === "false") {
      where.isActive = false;
    }

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    if (letter) {
      if (letter === "#") {
        // Not starting with A-Z
        where.AND = "abcdefghijklmnopqrstuvwxyz".split("").map((char) => ({
          NOT: { name: { startsWith: char, mode: "insensitive" } },
        }));
      } else {
        where.name = { ...where.name, startsWith: letter, mode: "insensitive" };
      }
    }

    const stores = await prisma.store.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        categories: { select: { categoryId: true } },
        subcategories: { select: { subcategoryId: true } },
      },
    });

    const serializedStores = stores.map((s) => ({
      ...s,
      _id: s.id,
      categories: s.categories.map((c) => c.categoryId),
      subcategories: s.subcategories.map((sc) => sc.subcategoryId),
    }));

    return NextResponse.json({ stores: serializedStores }, { status: 200 });
  } catch (error) {
    console.error("GET /api/stores Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user.role || "").toLowerCase();
    if (role !== ROLES.ADMIN && role !== ROLES.ADMINISTRATION) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const data = await request.json();

    if (!data.name || !data.slug || !data.logoPath) {
      return NextResponse.json(
        { message: "Name, slug, and logo are required." },
        { status: 400 }
      );
    }

    const existingStore = await prisma.store.findUnique({
      where: { slug: data.slug },
    });
    if (existingStore) {
      return NextResponse.json(
        { message: "A store with this slug already exists." },
        { status: 409 }
      );
    }

    const {
      categories = [],
      subcategories = [],
      id,
      _id,
      createdAt,
      updatedAt,
      ...storeFields
    } = data;

    const newStore = await prisma.store.create({
      data: {
        ...storeFields,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        logoStoragePath: data.logoStoragePath || data.logoPublicId || null,
        categories: categories.length > 0 ? {
          create: categories.map((catId) => ({ categoryId: catId })),
        } : undefined,
        subcategories: subcategories.length > 0 ? {
          create: subcategories.map((subId) => ({ subcategoryId: subId })),
        } : undefined,
      },
      include: {
        categories: { select: { categoryId: true } },
        subcategories: { select: { subcategoryId: true } },
      },
    });

    const responseStore = {
      ...newStore,
      _id: newStore.id,
      categories: newStore.categories.map((c) => c.categoryId),
      subcategories: newStore.subcategories.map((sc) => sc.subcategoryId),
    };

    return NextResponse.json({ store: responseStore }, { status: 201 });
  } catch (error) {
    console.error("POST /api/stores Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
