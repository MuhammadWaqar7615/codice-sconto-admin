import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
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

function parseRole(role) {
  const r = (role || "").toLowerCase();
  if (r === "admin" || r === "administration") return "ADMIN";
  if (r === "editor") return "EDITOR";
  return "SUBSCRIBER";
}

function serializeUser(u) {
  let role = "subscribor";
  if (u.role === "ADMIN") role = "administration";
  else if (u.role === "EDITOR") role = "editor";
  else if (u.role === "SUBSCRIBER") role = "subscribor";

  const { passwordHash, ...safeUser } = u;
  return {
    ...safeUser,
    _id: u.id,
    role,
    status: u.status ? u.status.toLowerCase() : "enabled",
  };
}

export async function GET() {
  try {
    const authError = await requireAdmin();
    if (authError) return NextResponse.json({ message: authError.message }, { status: authError.status });

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users: users.map(serializeUser) });
  } catch (error) {
    console.error("GET /api/users Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authError = await requireAdmin();
    if (authError) return NextResponse.json({ message: authError.message }, { status: authError.status });

    const body = await request.json();
    if (!body.name?.trim() || !body.email?.trim() || !body.password) {
      return NextResponse.json({ message: "Name, email, and password are required." }, { status: 400 });
    }

    const email = body.email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return NextResponse.json({ message: "A user with this email already exists." }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name: body.name.trim(),
        email,
        description: body.description || null,
        passwordHash: await hashPassword(body.password),
        role: parseRole(body.role),
        verified: Boolean(body.verified),
        status: (body.status || "enabled").toUpperCase() === "DISABLED" ? "DISABLED" : "ENABLED",
      },
    });

    return NextResponse.json({ user: serializeUser(user) }, { status: 201 });
  } catch (error) {
    console.error("POST /api/users Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
