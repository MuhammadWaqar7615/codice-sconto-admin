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

export async function PUT(request, { params }) {
  try {
    const authError = await requireAdmin();
    if (authError) return NextResponse.json({ message: authError.message }, { status: authError.status });

    const { key } = await params;
    const defaultTemplate = emailTemplateDefaults.find((template) => template.templateKey === key);
    if (!defaultTemplate) {
      return NextResponse.json({ message: "Email template not found." }, { status: 404 });
    }

    const body = await request.json();
    if (!body.subject?.trim() || !body.message?.trim()) {
      return NextResponse.json({ message: "Subject and message are required." }, { status: 400 });
    }

    const template = await prisma.emailTemplate.upsert({
      where: { templateKey: key },
      create: {
        templateKey: key,
        title: defaultTemplate.title,
        fromName: String(body.fromName || "CodiceSconto").trim(),
        sendAsPlainText: Boolean(body.sendAsPlainText),
        status: (body.status || "enabled").toUpperCase() === "DISABLED" ? "DISABLED" : "ENABLED",
        subject: body.subject.trim(),
        message: body.message,
      },
      update: {
        title: defaultTemplate.title,
        fromName: String(body.fromName || "CodiceSconto").trim(),
        sendAsPlainText: Boolean(body.sendAsPlainText),
        status: (body.status || "enabled").toUpperCase() === "DISABLED" ? "DISABLED" : "ENABLED",
        subject: body.subject.trim(),
        message: body.message,
      },
    });

    return NextResponse.json({
      message: "Email template saved successfully.",
      template: {
        ...template,
        _id: template.id,
        status: template.status.toLowerCase(),
      },
    });
  } catch (error) {
    console.error("PUT /api/email-templates/[key] Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
