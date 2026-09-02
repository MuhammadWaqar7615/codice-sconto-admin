import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import { getSession } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import SiteSettings from "@/models/SiteSettings";

const defaults = { maintenanceMode: false, languageDirection: "ltr", currencySymbol: "€", currencyPosition: "before", decimalSeparator: ".", decimalNumber: 2, dateFormat: "DD/MM/YYYY", timeZone: "Europe/Rome", defaultPages: {}, companyInfo: {}, smtp: { encryption: "tls", port: 587 }, googleAnalyticsCode: "", googleRecaptchaKey: "", googleRecaptchaSecret: "" };

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
    const settings = await SiteSettings.findOne().lean();
    return NextResponse.json({ settings: { ...defaults, ...(settings || {}), defaultPages: { ...defaults.defaultPages, ...(settings?.defaultPages || {}) }, companyInfo: { ...defaults.companyInfo, ...(settings?.companyInfo || {}) }, smtp: { ...defaults.smtp, ...(settings?.smtp || {}) } } });
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
    const payload = { ...defaults, ...body, maintenanceMode: Boolean(body.maintenanceMode), languageDirection: body.languageDirection === "rtl" ? "rtl" : "ltr", currencyPosition: ["before", "after", "before-space", "after-space"].includes(body.currencyPosition) ? body.currencyPosition : "before", decimalSeparator: body.decimalSeparator === "," ? "," : ".", decimalNumber: Math.max(0, Math.min(6, Number(body.decimalNumber) || 0)), defaultPages: body.defaultPages || {}, companyInfo: body.companyInfo || {}, smtp: { ...(body.smtp || {}), password: body.smtp?.password || undefined } };
    await connectMongo();
    const existing = await SiteSettings.findOne();
    if (existing && !body.smtp?.password) payload.smtp.password = existing.smtp.password;
    const settings = existing ? await SiteSettings.findByIdAndUpdate(existing._id, payload, { new: true, runValidators: true }).lean() : await SiteSettings.create(payload);
    return NextResponse.json({ message: "Site settings saved successfully.", settings: { ...settings, smtp: { ...settings.smtp, password: "" }, _id: settings._id.toString() } });
  } catch (error) {
    console.error("PUT /api/settings Error:", error);
    if (error.name === "ValidationError") return NextResponse.json({ message: Object.values(error.errors).map((item) => item.message).join(", ") }, { status: 400 });
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
