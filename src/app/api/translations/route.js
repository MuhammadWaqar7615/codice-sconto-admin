import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { translationDefaults } from "@/lib/translations";

async function requireAdmin() {
  const session = await getSession();
  if (!session?.user) return { message: "Unauthorized", status: 401 };
  const role = (session.user.role || "").toLowerCase();
  if (role !== ROLES.ADMIN && role !== ROLES.ADMINISTRATION) {
    return { message: "Forbidden", status: 403 };
  }
  return null;
}

export async function GET() {
  try {
    const authError = await requireAdmin();
    if (authError) return NextResponse.json({ message: authError.message }, { status: authError.status });

    const saved = await prisma.translation.findMany({
      orderBy: { key: "asc" },
    });
    const savedByKey = new Map(saved.map((item) => [item.key, item]));
    const translations = translationDefaults.map(([key, source]) => ({
      key,
      source,
      value: savedByKey.get(key)?.value || "",
    }));

    return NextResponse.json({ translations });
  } catch (error) {
    console.error("GET /api/translations Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const authError = await requireAdmin();
    if (authError) return NextResponse.json({ message: authError.message }, { status: authError.status });

    const body = await request.json();
    if (!Array.isArray(body.translations)) {
      return NextResponse.json({ message: "Translations must be an array." }, { status: 400 });
    }

    const allowed = new Map(translationDefaults);
    const validItems = body.translations.filter((item) => allowed.has(item.key));

    const chunkSize = 25;
    for (let i = 0; i < validItems.length; i += chunkSize) {
      const chunk = validItems.slice(i, i + chunkSize);
      await prisma.$transaction(
        chunk.map((item) =>
          prisma.translation.upsert({
            where: { key: item.key },
            create: {
              key: item.key,
              source: allowed.get(item.key),
              value: String(item.value || "").trim(),
            },
            update: {
              source: allowed.get(item.key),
              value: String(item.value || "").trim(),
            },
          })
        )
      );
    }

    return NextResponse.json({ message: "Translations saved successfully." });
  } catch (error) {
    console.error("PUT /api/translations Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
