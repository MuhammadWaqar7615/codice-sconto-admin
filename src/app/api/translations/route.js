import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import { getSession } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import Translation from "@/models/Translation";
import { translationDefaults } from "@/lib/translations";

async function requireAdmin() {
  const session = await getSession();
  if (!session?.user) return { message: "Unauthorized", status: 401 };
  if (![ROLES.ADMIN, ROLES.ADMINISTRATION].includes(session.user.role)) return { message: "Forbidden", status: 403 };
  return null;
}

export async function GET() {
  try {
    const authError = await requireAdmin();
    if (authError) return NextResponse.json({ message: authError.message }, { status: authError.status });
    await connectMongo();
    const saved = await Translation.find().sort({ key: 1 }).lean();
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
    if (!Array.isArray(body.translations)) return NextResponse.json({ message: "Translations must be an array." }, { status: 400 });

    const allowed = new Map(translationDefaults);
    const operations = body.translations
      .filter((item) => allowed.has(item.key))
      .map((item) => ({
        updateOne: {
          filter: { key: item.key },
          update: { $set: { source: allowed.get(item.key), value: String(item.value || "").trim() } },
          upsert: true,
        },
      }));

    await connectMongo();
    if (operations.length) await Translation.bulkWrite(operations);
    return NextResponse.json({ message: "Translations saved successfully." });
  } catch (error) {
    console.error("PUT /api/translations Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
