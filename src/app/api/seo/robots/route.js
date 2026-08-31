import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import { getSession } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import RobotsConfig from "@/models/RobotsConfig";

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

export async function GET() {
  try {
    await connectMongo();
    const config = (await RobotsConfig.findOne().lean()) || {
      allowCrawlers: true,
      sitemapUrl: "https://www.codicesconto.com/sitemap.xml",
      disallowPaths: ["/api/", "/dashboard/", "/account/"],
      additionalRules: "",
      isActive: true,
    };

    return NextResponse.json({ config });
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

    await connectMongo();
    const body = await request.json();

    const payload = {
      allowCrawlers: Boolean(body.allowCrawlers ?? true),
      sitemapUrl: String(body.sitemapUrl || "https://www.codicesconto.com/sitemap.xml").trim(),
      disallowPaths: Array.isArray(body.disallowPaths)
        ? body.disallowPaths.map((path) => String(path).trim()).filter(Boolean)
        : ["/api/", "/dashboard/", "/account/"],
      additionalRules: String(body.additionalRules || "").trim(),
      isActive: Boolean(body.isActive ?? true),
    };

    const existing = await RobotsConfig.findOne();
    const config = existing
      ? await RobotsConfig.findByIdAndUpdate(existing._id, payload, { new: true, runValidators: true })
      : await RobotsConfig.create(payload);

    return NextResponse.json({
      message: "Robots configuration saved successfully.",
      config: { ...config.toObject(), _id: config._id.toString() },
    });
  } catch (error) {
    console.error("POST /api/seo/robots Error:", error);
    if (error.name === "ValidationError") {
      return NextResponse.json({ message: Object.values(error.errors).map((item) => item.message).join(", ") }, { status: 400 });
    }
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET_ROBOTS() {
  try {
    await connectMongo();
    const config = (await RobotsConfig.findOne().lean()) || {
      allowCrawlers: true,
      sitemapUrl: "https://www.codicesconto.com/sitemap.xml",
      disallowPaths: ["/api/", "/dashboard/", "/account/"],
      additionalRules: "",
      isActive: true,
    };

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
