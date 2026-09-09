import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/auth";
import { ROLES } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";
import PromoBannerForm from "@/components/admin/promo-banners/PromoBannerForm";

export const metadata = { title: "Edit Promo Banner | CodiceSconto Admin" };

export default async function EditPromoBannerPage({ params }) {
  await requireRole([ROLES.ADMIN, ROLES.ADMINISTRATION]);
  const { id } = await params;
  const promoBanner = await prisma.promoBanner.findUnique({
    where: { id },
  });
  if (!promoBanner) notFound();

  return (
    <PromoBannerForm
      promoBanner={{
        ...promoBanner,
        _id: promoBanner.id,
        status: promoBanner.status ? promoBanner.status.toLowerCase() : "enabled",
      }}
    />
  );
}
