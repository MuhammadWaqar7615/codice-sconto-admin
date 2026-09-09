import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";

const defaults = {
  maintenanceMode: false,
  languageDirection: "ltr",
  currencySymbol: "€",
  currencyPosition: "before",
  decimalSeparator: ".",
  decimalNumber: 2,
  dateFormat: "DD/MM/YYYY",
  timeZone: "Europe/Rome",
  defaultPages: {},
  companyInfo: {},
  smtp: { encryption: "tls", port: 587 },
  googleAnalyticsCode: "",
  googleRecaptchaKey: "",
  googleRecaptchaSecret: "",
};

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

    const settings = await prisma.siteSettings.findFirst();

    return NextResponse.json({
      settings: {
        ...defaults,
        ...(settings || {}),
        _id: settings?.id,
        defaultPages: { ...defaults.defaultPages, ...(settings?.defaultPages || {}) },
        companyInfo: { ...defaults.companyInfo, ...(settings?.companyInfo || {}) },
        smtp: { ...defaults.smtp, ...(settings?.smtp || {}) },
      },
    });
  } catch (error) {
    console.error("GET /api/settings Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const authError = await requireAdmin();
    if (authError) return NextResponse.json({ message: authError.message }, { status: authError.status });

    const body = await request.json();
    const existing = await prisma.siteSettings.findFirst();

    const smtpPayload = { ...(body.smtp || {}) };
    if (!smtpPayload.password && existing?.smtp?.password) {
      smtpPayload.password = existing.smtp.password;
    }

    const payload = {
      maintenanceMode: Boolean(body.maintenanceMode),
      languageDirection: body.languageDirection === "rtl" ? "rtl" : "ltr",
      currencySymbol: body.currencySymbol || defaults.currencySymbol,
      currencyPosition: ["before", "after", "before-space", "after-space"].includes(body.currencyPosition)
        ? body.currencyPosition
        : "before",
      decimalSeparator: body.decimalSeparator === "," ? "," : ".",
      decimalNumber: Math.max(0, Math.min(6, Number(body.decimalNumber) || 0)),
      dateFormat: body.dateFormat || defaults.dateFormat,
      timeZone: body.timeZone || defaults.timeZone,
      defaultPages: body.defaultPages || {},
      companyInfo: body.companyInfo || {},
      smtp: smtpPayload,
      googleAnalyticsCode: body.googleAnalyticsCode || "",
      googleRecaptchaKey: body.googleRecaptchaKey || "",
      googleRecaptchaSecret: body.googleRecaptchaSecret || "",
    };

    let settings;
    if (existing) {
      settings = await prisma.siteSettings.update({
        where: { id: existing.id },
        data: payload,
      });
    } else {
      settings = await prisma.siteSettings.create({
        data: payload,
      });
    }

    const safeSmtp = { ...(settings.smtp || {}), password: "" };

    return NextResponse.json({
      message: "Site settings saved successfully.",
      settings: {
        ...settings,
        _id: settings.id,
        smtp: safeSmtp,
      },
    });
  } catch (error) {
    console.error("PUT /api/settings Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
