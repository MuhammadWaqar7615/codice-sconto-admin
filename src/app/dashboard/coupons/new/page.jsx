import { requireRole } from "@/lib/auth/auth";
import { ROLES } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";
import CouponForm from "@/components/admin/coupons/CouponForm";

export const metadata = { title: "Add Coupon | CodiceSconto Admin" };

export default async function NewCouponPage() {
  const stores = (
    await prisma.store.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    })
  ).map((store) => ({ _id: store.id, id: store.id, name: store.name }));

  return <CouponForm stores={stores} />;
}
