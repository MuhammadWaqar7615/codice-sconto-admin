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

function serializeBanner(b) {
  return {
    ...b,
    _id: b.id,
    status: b.status ? b.status.toLowerCase() : "enabled",
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

    const promoBanners = await prisma.promoBanner.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      promoBanners: promoBanners.map(serializeBanner),
    });
  } catch (error) {
    console.error("GET /api/promo-banners Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authError = await requireAdmin();
    if (authError) return NextResponse.json({ message: authError.message }, { status: authError.status });

    const body = await request.json();
    if (!body.heading?.trim() || !body.description?.trim() || !body.image?.trim()) {
      return NextResponse.json({ message: "Heading, description, and image are required." }, { status: 400 });
    }

    const promoBanner = await prisma.promoBanner.create({
      data: {
        heading: body.heading,
        description: body.description,
        image: body.image,
        imagePublicId: body.imagePublicId || null,
        imageStoragePath: body.imageStoragePath || body.imagePublicId || null,
        status: (body.status || "enabled").toUpperCase() === "DISABLED" ? "DISABLED" : "ENABLED",
      },
    });

    return NextResponse.json({ promoBanner: serializeBanner(promoBanner) }, { status: 201 });
  } catch (error) {
    console.error("POST /api/promo-banners Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
