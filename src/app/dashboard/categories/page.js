import Link from "next/link";
import { requireRole } from "@/lib/auth/auth";
import { ROLES } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";
import CategoryTable from "@/components/admin/categories/CategoryTable";

export const metadata = { title: "Categories | CodiceSconto Admin" };

export default async function CategoriesPage() {
  await requireRole([ROLES.ADMIN, ROLES.ADMINISTRATION]);
  const rawCategories = await prisma.category.findMany({
    orderBy: { title: "asc" },
  });
  const categories = rawCategories.map((category) => ({
    ...category,
    _id: category.id,
    status: category.status ? category.status.toLowerCase() : "enabled",
    createdAt: category.createdAt ? category.createdAt.toISOString() : null,
    updatedAt: category.updatedAt ? category.updatedAt.toISOString() : null,
  }));

  return (
    <main className="min-h-screen bg-white">
      <header className="flex flex-col gap-4 border-b border-gray-200 bg-accent-light px-4 py-6 md:flex-row md:items-center md:justify-between md:px-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
          <p className="mt-1 text-sm text-gray-600">Manage menu and featured categories.</p>
        </div>
        <Link
          href="/dashboard/categories/new"
          className="rounded-lg bg-accent px-4 py-2 text-center text-sm font-medium text-white hover:bg-accent-hover"
        >
          Add Category
        </Link>
      </header>
      <section className="px-4 py-8 md:px-8">
        <CategoryTable categories={categories} />
      </section>
    </main>
  );
}
