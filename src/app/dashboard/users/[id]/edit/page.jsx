import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/auth";
import { ROLES } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";
import UserForm from "@/components/admin/users/UserForm";

export const metadata = { title: "Edit User | CodiceSconto Admin" };

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

export default async function EditUserPage({ params }) {
  await requireRole([ROLES.ADMIN, ROLES.ADMINISTRATION]);
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user) notFound();
  return <UserForm user={serializeUser(user)} />;
}
