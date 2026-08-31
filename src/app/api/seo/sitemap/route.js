import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import { getSession } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import SitemapConfig from "@/models/SitemapConfig";
import Store from "@/models/Store";
import Category from "@/models/Category";
import Subcategory from "@/models/Subcategory";
import BlogPost from "@/models/BlogPost";
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

function buildUrlEntry(url, lastmod) {
  return `  <url>\n    <loc>${url}</loc>\n    ${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ""}  </url>`;
}

export async function GET() {
  try {
    await connectMongo();
    const config = (await SitemapConfig.findOne().lean()) || {
      siteUrl: "https://www.codicesconto.com",
      includeHome: true,
      includeStores: true,
      includeCategories: true,
      includeSubcategories: true,
      includeBlog: true,
      includeSeoPages: true,
      isActive: true,
    };

    if (!config.isActive) {
      return NextResponse.json({ message: "Sitemap generation is disabled." }, { status: 403 });
    }

    const baseUrl = config.siteUrl.replace(/\/$/, "");
    const entries = [];

    if (config.includeHome) entries.push(buildUrlEntry(`${baseUrl}/`, new Date().toISOString()));

    if (config.includeStores) {
      const stores = await Store.find({ isActive: true }).select("slug updatedAt").lean();
      stores.forEach((store) => entries.push(buildUrlEntry(`${baseUrl}/negozi/${store.slug}`, store.updatedAt ? new Date(store.updatedAt).toISOString() : undefined)));
    }

    if (config.includeCategories) {
      const categories = await Category.find({ status: "enabled" }).select("slug updatedAt").lean();
      categories.forEach((category) => entries.push(buildUrlEntry(`${baseUrl}/categorie/${category.slug}`, category.updatedAt ? new Date(category.updatedAt).toISOString() : undefined)));
    }

    if (config.includeSubcategories) {
      const subcategories = await Subcategory.find({ status: "enabled" }).select("slug updatedAt").lean();
      subcategories.forEach((subcategory) => entries.push(buildUrlEntry(`${baseUrl}/categorie/${subcategory.slug}`, subcategory.updatedAt ? new Date(subcategory.updatedAt).toISOString() : undefined)));
    }

    if (config.includeBlog) {
      const posts = await BlogPost.find({ status: "enabled" }).select("title updatedAt").lean();
      posts.forEach((post) => {
        const slug = String(post.title || "")
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        entries.push(buildUrlEntry(`${baseUrl}/blog/${slug || "post"}`, post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined));
      });
    }

    if (config.includeSeoPages) {
      const seoPages = await SeoPage.find({ isActive: true }).select("path updatedAt").lean();
      seoPages.forEach((page) => entries.push(buildUrlEntry(`${baseUrl}${page.path}`, page.updatedAt ? new Date(page.updatedAt).toISOString() : undefined)));
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("GET /api/seo/sitemap Error:", error);
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
    const payload = {
      siteUrl: String(body.siteUrl || "https://www.codicesconto.com").trim(),
      includeHome: Boolean(body.includeHome ?? true),
      includeStores: Boolean(body.includeStores ?? true),
      includeCategories: Boolean(body.includeCategories ?? true),
      includeSubcategories: Boolean(body.includeSubcategories ?? true),
      includeBlog: Boolean(body.includeBlog ?? true),
      includeSeoPages: Boolean(body.includeSeoPages ?? true),
      isActive: Boolean(body.isActive ?? true),
    };

    const existing = await SitemapConfig.findOne();
    const config = existing
      ? await SitemapConfig.findByIdAndUpdate(existing._id, payload, { new: true, runValidators: true })
      : await SitemapConfig.create(payload);

    return NextResponse.json({
      message: "Sitemap configuration saved successfully.",
      config: { ...config.toObject(), _id: config._id.toString() },
    });
  } catch (error) {
    console.error("POST /api/seo/sitemap Error:", error);
    if (error.name === "ValidationError") {
      return NextResponse.json({ message: Object.values(error.errors).map((item) => item.message).join(", ") }, { status: 400 });
    }
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
