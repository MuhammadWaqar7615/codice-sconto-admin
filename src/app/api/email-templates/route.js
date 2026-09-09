import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { emailTemplateDefaults } from "@/lib/emailTemplates";

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

    const saved = await prisma.emailTemplate.findMany();
    const byKey = new Map(saved.map((template) => [template.templateKey, template]));

    const templates = emailTemplateDefaults.map((template) => {
      const dbItem = byKey.get(template.templateKey);
      return {
        ...template,
        fromName: dbItem?.fromName || "CodiceSconto",
        sendAsPlainText: dbItem?.sendAsPlainText || false,
        status: dbItem?.status ? dbItem.status.toLowerCase() : "enabled",
        subject: dbItem?.subject || template.subject,
        message: dbItem?.message || template.message,
        _id: dbItem?.id || template.templateKey,
      };
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("GET /api/email-templates Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
