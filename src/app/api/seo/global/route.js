import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import { getSession } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import GlobalSeo from "@/models/GlobalSeo";

async function requireAdmin() {
  const session = await getSession();

  if (!session?.user) {
    return { message: "Unauthorized", status: 401 };
  }

  if (session.user.role !== ROLES.ADMIN && session.user.role !== ROLES.ADMINISTRATION) {
    return { message: "Forbidden", status: 403 };
  }

  return null;
}

function normalizeKeywords(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeSocialLinks(value = {}) {
  return {
    facebook: String(value.facebook || "").trim(),
    instagram: String(value.instagram || "").trim(),
    linkedin: String(value.linkedin || "").trim(),
    youtube: String(value.youtube || "").trim(),
    twitter: String(value.twitter || "").trim(),
  };
}

export async function GET() {
  try {
    await connectMongo();
    const settings = await GlobalSeo.findOne().lean();

    return NextResponse.json({
      settings: settings
        ? {
            ...settings,
            _id: settings._id.toString(),
            defaultKeywords: settings.defaultKeywords || [],
            socialLinks: settings.socialLinks || {},
          }
        : null,
    });
  } catch (error) {
    console.error("GET /api/seo/global Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authError = await requireAdmin();
    if (authError) {
      return NextResponse.json({ message: authError.message }, { status: authError.status });
    }

    await connectMongo();
    const body = await request.json();

    if (!body.siteName?.trim()) {
      return NextResponse.json({ message: "Site name is required." }, { status: 400 });
    }

    if (!body.siteUrl?.trim()) {
      return NextResponse.json({ message: "Site URL is required." }, { status: 400 });
    }

    const payload = {
      siteName: body.siteName.trim(),
      siteUrl: body.siteUrl.trim(),
      defaultTitle: String(body.defaultTitle || "").trim(),
      titleTemplate: String(body.titleTemplate || "%s").trim() || "%s",
      defaultDescription: String(body.defaultDescription || "").trim(),
      defaultKeywords: normalizeKeywords(body.defaultKeywords),
      defaultOgImage: String(body.defaultOgImage || "").trim(),
      twitterHandle: String(body.twitterHandle || "").trim(),
      favicon: String(body.favicon || "").trim(),
      socialLinks: normalizeSocialLinks(body.socialLinks),
    };

    const existing = await GlobalSeo.findOne();
    const settings = existing
      ? await GlobalSeo.findByIdAndUpdate(existing._id, payload, { new: true, runValidators: true })
      : await GlobalSeo.create(payload);

    return NextResponse.json({
      message: "Global SEO settings saved successfully.",
      settings: { ...settings.toObject(), _id: settings._id.toString() },
    });
  } catch (error) {
    console.error("POST /api/seo/global Error:", error);
    if (error.name === "ValidationError") {
      return NextResponse.json({ message: Object.values(error.errors).map((item) => item.message).join(", ") }, { status: 400 });
    }
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
