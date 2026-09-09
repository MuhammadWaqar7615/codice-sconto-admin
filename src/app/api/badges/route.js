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

export async function GET() {
  try {
    const badges = await prisma.badge.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({
      badges: badges.map((b) => ({ ...b, _id: b.id })),
    });
  } catch (error) {
    console.error("GET /api/badges Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authError = await requireAdmin();
    if (authError) return NextResponse.json({ message: authError.message }, { status: authError.status });

    const body = await request.json();
    if (!body.name?.trim() || !body.image?.trim()) {
      return NextResponse.json({ message: "Name and image are required." }, { status: 400 });
    }

    const badge = await prisma.badge.create({
      data: {
        name: body.name,
        image: body.image,
        imagePublicId: body.imagePublicId || null,
        imageStoragePath: body.imageStoragePath || body.imagePublicId || null,
      },
    });

    return NextResponse.json({ badge: { ...badge, _id: badge.id } }, { status: 201 });
  } catch (error) {
    console.error("POST /api/badges Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
