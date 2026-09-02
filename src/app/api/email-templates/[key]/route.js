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

export async function PUT(request, { params }) {
  try {
    const authError = await requireAdmin();
    if (authError) return NextResponse.json({ message: authError.message }, { status: authError.status });
    const { key } = await params;
    const defaultTemplate = emailTemplateDefaults.find((template) => template.templateKey === key);
    if (!defaultTemplate) return NextResponse.json({ message: "Email template not found." }, { status: 404 });
    const body = await request.json();
    if (!body.subject?.trim() || !body.message?.trim()) return NextResponse.json({ message: "Subject and message are required." }, { status: 400 });

    await connectMongo();
    const template = await EmailTemplate.findOneAndUpdate(
      { templateKey: key },
      {
        templateKey: key,
        title: defaultTemplate.title,
        fromName: String(body.fromName || "CodiceSconto").trim(),
        sendAsPlainText: Boolean(body.sendAsPlainText),
        status: body.status === "disabled" ? "disabled" : "enabled",
        subject: body.subject.trim(),
        message: body.message,
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();
    return NextResponse.json({ message: "Email template saved successfully.", template: { ...template, _id: template._id.toString() } });
  } catch (error) {
    console.error("PUT /api/email-templates/[key] Error:", error);
    if (error.name === "ValidationError") return NextResponse.json({ message: Object.values(error.errors).map((item) => item.message).join(", ") }, { status: 400 });
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
