import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q || q.length < 2) {
      return NextResponse.json({ stores: [], coupons: [] });
    }

    const [stores, coupons] = await Promise.all([
      prisma.store.findMany({
        where: {
          name: { contains: q, mode: "insensitive" },
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          logoPath: true,
        },
        take: 5,
      }),
      prisma.coupon.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
          isActive: true,
        },
        include: {
          store: {
            select: { id: true, name: true, slug: true, logoPath: true },
          },
        },
        take: 5,
      }),
    ]);

    const serializedStores = stores.map((s) => ({
      ...s,
      _id: s.id,
    }));

    const serializedCoupons = coupons.map((c) => ({
      id: c.id,
      _id: c.id,
      title: c.title,
      type: c.type ? c.type.toLowerCase() : "code",
      discount: c.discount,
      storeId: c.store ? { ...c.store, _id: c.store.id } : null,
      store: c.store ? { ...c.store, _id: c.store.id } : null,
    }));

    return NextResponse.json({ stores: serializedStores, coupons: serializedCoupons });
  } catch (error) {
    console.error("Live Search API error:", error);
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
}
