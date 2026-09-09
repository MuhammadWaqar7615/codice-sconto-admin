import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/auth";
import { ROLES } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";
import SubcategoryForm from "@/components/admin/subcategories/SubcategoryForm";

export const metadata = { title: "Edit Subcategory | CodiceSconto Admin" };

export default async function EditSubcategoryPage({ params }) {
  await requireRole([ROLES.ADMIN, ROLES.ADMINISTRATION]);
  const { id } = await params;

  const [subcategory, categories] = await Promise.all([
    prisma.subcategory.findUnique({
      where: { id },
    }),
    prisma.category.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
  ]);
  if (!subcategory) notFound();

  return (
    <SubcategoryForm
      subcategory={{
        ...subcategory,
        _id: subcategory.id,
        status: subcategory.status ? subcategory.status.toLowerCase() : "enabled",
        parentCategory: subcategory.parentCategoryId,
      }}
      categories={categories.map((category) => ({ _id: category.id, id: category.id, title: category.title }))}
    />
  );
}
