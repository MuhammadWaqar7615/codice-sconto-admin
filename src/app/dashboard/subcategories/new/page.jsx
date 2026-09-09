import { requireRole } from "@/lib/auth/auth";
import { ROLES } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";
import SubcategoryForm from "@/components/admin/subcategories/SubcategoryForm";

export const metadata = { title: "Add Subcategory | CodiceSconto Admin" };

export default async function NewSubcategoryPage() {
  await requireRole([ROLES.ADMIN, ROLES.ADMINISTRATION]);
  const categories = (
    await prisma.category.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    })
  ).map((category) => ({ _id: category.id, id: category.id, title: category.title }));

  return <SubcategoryForm categories={categories} />;
}
