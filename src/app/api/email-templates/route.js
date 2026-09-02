import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import { getSession } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import EmailTemplate from "@/models/EmailTemplate";
import { emailTemplateDefaults } from "@/lib/emailTemplates";

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
    const saved = await EmailTemplate.find().lean();
    const byKey = new Map(saved.map((template) => [template.templateKey, template]));
    const templates = emailTemplateDefaults.map((template) => ({
      ...template,
      fromName: byKey.get(template.templateKey)?.fromName || "CodiceSconto",
      sendAsPlainText: byKey.get(template.templateKey)?.sendAsPlainText || false,
      status: byKey.get(template.templateKey)?.status || "enabled",
      subject: byKey.get(template.templateKey)?.subject || template.subject,
      message: byKey.get(template.templateKey)?.message || template.message,
      _id: byKey.get(template.templateKey)?._id?.toString() || template.templateKey,
    }));
    return NextResponse.json({ templates });
  } catch (error) {
    console.error("GET /api/email-templates Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
