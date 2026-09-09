import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { deleteFromSupabase } from "@/lib/supabase";

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user.role || "").toLowerCase();
    if (role !== ROLES.ADMIN && role !== ROLES.ADMINISTRATION) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const data = await request.json();

    if (!data.storeIds || !Array.isArray(data.storeIds) || data.storeIds.length === 0) {
      return NextResponse.json({ message: "Invalid or empty storeIds array." }, { status: 400 });
    }

    // Attempt to clean up logos
    const storesToDelete = await prisma.store.findMany({
      where: { id: { in: data.storeIds } },
      select: { logoStoragePath: true, logoPublicId: true },
    });

    for (const store of storesToDelete) {
      const path = store.logoStoragePath || store.logoPublicId;
      if (path) {
        await deleteFromSupabase("store-images", path);
      }
    }

    const result = await prisma.store.deleteMany({
      where: { id: { in: data.storeIds } },
    });

    return NextResponse.json(
      { message: `Successfully deleted ${result.count} stores.` },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/stores/bulk-delete Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
