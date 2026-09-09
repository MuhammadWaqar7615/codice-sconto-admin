import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/auth";
import { ROLES } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";
import BadgeForm from "@/components/admin/badges/BadgeForm";

export const metadata = { title: "Edit Badge | CodiceSconto Admin" };

export default async function EditBadgePage({ params }) {
  await requireRole([ROLES.ADMIN, ROLES.ADMINISTRATION]);
  const { id } = await params;
  const badge = await prisma.badge.findUnique({
    where: { id },
  });
  if (!badge) notFound();
  return <BadgeForm badge={{ ...badge, _id: badge.id }} />;
}
