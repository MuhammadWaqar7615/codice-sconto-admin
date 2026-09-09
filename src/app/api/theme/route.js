import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";

async function requireAdmin() {
  const session = await getSession();
  if (!session?.user) return { message: "Unauthorized", status: 401 };
  const role = (session.user.role || "").toLowerCase();
  if (role !== ROLES.ADMIN && role !== ROLES.ADMINISTRATION) {
    return { message: "Forbidden", status: 403 };
  }
  return null;
}

const defaults = {
  primaryColor: "#1B2A4A",
  secondaryColor: "#243B6A",
  layoutHeader: "style-1",
  mobileHeader: "style-1",
  headerStyle: "style-1",
  homeStyle: "home-1",
  logo: "",
  transparentLogo: "",
  favicon: "",
  homeBackgroundImage: "",
};

export async function GET() {
  try {
    const authError = await requireAdmin();
    if (authError) return NextResponse.json({ message: authError.message }, { status: authError.status });

    const theme = await prisma.theme.findFirst();

    return NextResponse.json({
      theme: {
        ...defaults,
        ...(theme || {}),
        _id: theme?.id,
      },
    });
  } catch (error) {
    console.error("GET /api/theme Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const authError = await requireAdmin();
    if (authError) return NextResponse.json({ message: authError.message }, { status: authError.status });

    const body = await request.json();
    const payload = {
      primaryColor: String(body.primaryColor || defaults.primaryColor).trim(),
      secondaryColor: String(body.secondaryColor || defaults.secondaryColor).trim(),
      layoutHeader: body.layoutHeader === "style-2" ? "style-2" : "style-1",
      mobileHeader: body.mobileHeader === "style-2" ? "style-2" : "style-1",
      headerStyle: ["style-1", "style-2", "style-3"].includes(body.headerStyle) ? body.headerStyle : "style-1",
      homeStyle: ["home-1", "home-2", "home-3"].includes(body.homeStyle) ? body.homeStyle : "home-1",
      logo: String(body.logo || "").trim(),
      transparentLogo: String(body.transparentLogo || "").trim(),
      favicon: String(body.favicon || "").trim(),
      homeBackgroundImage: String(body.homeBackgroundImage || "").trim(),
    };

    if (!/^#[0-9A-Fa-f]{6}$/.test(payload.primaryColor) || !/^#[0-9A-Fa-f]{6}$/.test(payload.secondaryColor)) {
      return NextResponse.json({ message: "Colors must use six-digit hexadecimal values." }, { status: 400 });
    }

    const existing = await prisma.theme.findFirst();
    let theme;
    if (existing) {
      theme = await prisma.theme.update({
        where: { id: existing.id },
        data: payload,
      });
    } else {
      theme = await prisma.theme.create({
        data: payload,
      });
    }

    return NextResponse.json({
      message: "Theme settings saved successfully.",
      theme: { ...theme, _id: theme.id },
    });
  } catch (error) {
    console.error("PUT /api/theme Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
