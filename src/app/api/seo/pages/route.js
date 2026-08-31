import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectMongo from "@/lib/mongodb";
import { getSession } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import SeoPage from "@/models/SeoPage";

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

function isValidUrl(value) {
  if (!value) return true;

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    await connectMongo();
    const pages = await SeoPage.find().sort({ pageName: 1 }).lean();

    return NextResponse.json({
      pages: pages.map((page) => ({
        ...page,
        _id: page._id.toString(),
      })),
    });
  } catch (error) {
    console.error("GET /api/seo/pages Error:", error);
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

    if (!body.pageName?.trim()) {
      return NextResponse.json({ message: "Page name is required." }, { status: 400 });
    }

    if (!body.path?.trim()) {
      return NextResponse.json({ message: "Page path is required." }, { status: 400 });
    }

    const normalizedPath = String(body.path).trim();
    if (!normalizedPath.startsWith("/")) {
      return NextResponse.json({ message: "Page path must start with /." }, { status: 400 });
    }

    if (body.isActive && !body.title?.trim()) {
      return NextResponse.json({ message: "SEO title is required when the page is active." }, { status: 400 });
    }

    if (body.canonicalUrl && !isValidUrl(body.canonicalUrl)) {
      return NextResponse.json({ message: "Canonical URL is invalid." }, { status: 400 });
    }

    const existing = await SeoPage.findOne({ path: normalizedPath.toLowerCase() });
    if (existing) {
      return NextResponse.json({ message: "A page SEO record for this path already exists." }, { status: 409 });
    }

    const payload = {
      pageName: body.pageName.trim(),
      path: normalizedPath.toLowerCase(),
      title: String(body.title || "").trim(),
      description: String(body.description || "").trim(),
      keywords: normalizeKeywords(body.keywords),
      canonicalUrl: String(body.canonicalUrl || "").trim(),
      robots: {
        index: Boolean(body.robots?.index ?? true),
        follow: Boolean(body.robots?.follow ?? true),
        noarchive: Boolean(body.robots?.noarchive ?? false),
        nosnippet: Boolean(body.robots?.nosnippet ?? false),
        noimageindex: Boolean(body.robots?.noimageindex ?? false),
      },
      openGraph: {
        title: String(body.openGraph?.title || "").trim(),
        description: String(body.openGraph?.description || "").trim(),
        image: String(body.openGraph?.image || "").trim(),
        type: String(body.openGraph?.type || "website").trim(),
      },
      twitter: {
        card: String(body.twitter?.card || "summary_large_image").trim(),
        title: String(body.twitter?.title || "").trim(),
        description: String(body.twitter?.description || "").trim(),
        image: String(body.twitter?.image || "").trim(),
      },
      schema: body.schema || {},
      isActive: Boolean(body.isActive ?? true),
    };

    const page = await SeoPage.create(payload);

    return NextResponse.json({
      message: "SEO page created successfully.",
      page: { ...page.toObject(), _id: page._id.toString() },
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/seo/pages Error:", error);
    if (error.name === "ValidationError") {
      return NextResponse.json({ message: Object.values(error.errors).map((item) => item.message).join(", ") }, { status: 400 });
    }
    if (error.code === 11000) {
      return NextResponse.json({ message: "A page SEO record for this path already exists." }, { status: 409 });
    }
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
