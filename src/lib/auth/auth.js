import { getSession } from "./session";
import { redirect } from "next/navigation";
import { ROLES } from "./roles";
import prisma from "@/lib/prisma";
import { verifyPassword } from "./password";

export function normalizeRole(role) {
  if (!role) return "editor";
  const roleMap = {
    admin: "administration",
    administration: "administration",
    editor: "editor",
    subscriber: "subscribor",
    subscribor: "subscribor",
  };
  return roleMap[String(role).toLowerCase()] || "editor";
}

export async function authenticateUser(email, password) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("Server authentication configuration missing.");
  }

  // Check admin credentials
  if (email === adminEmail && password === adminPassword) {
    return {
      userId: "admin-id-001",
      email: adminEmail,
      role: normalizeRole(ROLES.ADMIN),
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (user && user.status === "ENABLED" && (await verifyPassword(password, user.passwordHash))) {
    return {
      userId: user.id,
      email: user.email,
      role: normalizeRole(user.role),
      name: user.name,
    };
  }

  return null; // Invalid credentials
}

export async function requireAuth() {
  const session = await getSession();

  if (!session || !session.user) {
    redirect("/account/login");
  }

  return session.user;
}

export async function requireRole(allowedRoles) {
  const user = await requireAuth();

  const normalizedAllowed = (Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]).map((r) =>
    normalizeRole(r)
  );
  const currentRole = normalizeRole(user.role);

  const hasAccess = normalizedAllowed.includes(currentRole);

  if (!hasAccess) {
    redirect("/dashboard");
  }

  return user;
}
