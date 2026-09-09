import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";

async function requireAdmin() {
  const session = await getSession();
  if (!session?.user) {
    return { message: "Unauthorized", status: 401 };
  }
  const role = (session.user.role || "").toLowerCase();
  if (role !== ROLES.ADMIN && role !== ROLES.ADMINISTRATION) {
    return { message: "Forbidden", status: 403 };
  }
  return null;
}

const defaults = {
  allowCrawlers: true,
  sitemapUrl: "https://www.codicesconto.com/sitemap.xml",
  disallowPaths: ["/api/", "/dashboard/", "/account/"],
  additionalRules: "",
  isActive: true,
};

export async function GET() {
  try {
    const config = await prisma.robotsConfig.findFirst();

    return NextResponse.json({
      config: config
        ? { ...config, _id: config.id }
        : defaults,
    });
  } catch (error) {
    console.error("GET /api/seo/robots Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authError = await requireAdmin();
    if (authError) {
      return NextResponse.json({ message: authError.message }, { status: authError.status });
    }

    const body = await request.json();

    const payload = {
      allowCrawlers: Boolean(body.allowCrawlers ?? true),
      sitemapUrl: String(body.sitemapUrl || "https://www.codicesconto.com/sitemap.xml").trim(),
      disallowPaths: Array.isArray(body.disallowPaths)
        ? body.disallowPaths.map((path) => String(path).trim()).filter(Boolean)
        : defaults.disallowPaths,
      additionalRules: String(body.additionalRules || "").trim(),
      isActive: Boolean(body.isActive ?? true),
    };

    const existing = await prisma.robotsConfig.findFirst();
    let config;
    if (existing) {
      config = await prisma.robotsConfig.update({
        where: { id: existing.id },
        data: payload,
      });
    } else {
      config = await prisma.robotsConfig.create({
        data: payload,
      });
    }

    return NextResponse.json({
      message: "Robots configuration saved successfully.",
      config: { ...config, _id: config.id },
    });
  } catch (error) {
    console.error("POST /api/seo/robots Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET_ROBOTS() {
  try {
    const dbConfig = await prisma.robotsConfig.findFirst();
    const config = dbConfig || defaults;

    if (!config.isActive) {
      return new NextResponse("User-agent: *\nDisallow: /\n", {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const lines = ["User-agent: *"];

    if (!config.allowCrawlers) {
      lines.push("Disallow: /");
    } else {
      const disallows = Array.isArray(config.disallowPaths) && config.disallowPaths.length
        ? config.disallowPaths.map((path) => `Disallow: ${path}`)
        : ["Disallow: /api/", "Disallow: /dashboard/", "Disallow: /account/"];
      lines.push(...disallows);
    }

    if (config.sitemapUrl) {
      lines.push(`Sitemap: ${config.sitemapUrl}`);
    }

    if (config.additionalRules) {
      lines.push(config.additionalRules);
    }

    return new NextResponse(`${lines.join("\n")}\n`, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("GET robots.txt Error:", error);
    return new NextResponse("User-agent: *\nDisallow: /\n", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
