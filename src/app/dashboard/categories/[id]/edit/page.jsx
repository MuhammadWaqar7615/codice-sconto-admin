import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/auth";
import { ROLES } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";
import CategoryForm from "@/components/admin/categories/CategoryForm";

export const metadata = { title: "Edit Category | CodiceSconto Admin" };

export default async function EditCategoryPage({ params }) {
  await requireRole([ROLES.ADMIN, ROLES.ADMINISTRATION]);
  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id },
  });
  if (!category) notFound();

  return (
    <CategoryForm
      category={{
        ...category,
        _id: category.id,
        status: category.status ? category.status.toLowerCase() : "enabled",
      }}
    />
  );
}
