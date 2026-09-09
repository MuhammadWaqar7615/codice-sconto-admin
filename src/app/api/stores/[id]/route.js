import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { deleteFromSupabase } from "@/lib/supabase";

async function checkAdminAuth() {
  const session = await getSession();
  if (!session || !session.user) {
    return { error: "Unauthorized", status: 401 };
  }
  const role = (session.user.role || "").toLowerCase();
  if (role !== ROLES.ADMIN && role !== ROLES.ADMINISTRATION) {
    return { error: "Forbidden", status: 403 };
  }
  return null;
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        categories: { select: { categoryId: true } },
        subcategories: { select: { subcategoryId: true } },
      },
    });

    if (!store) {
      return NextResponse.json({ message: "Store not found" }, { status: 404 });
    }

    const serializedStore = {
      ...store,
      _id: store.id,
      categories: store.categories.map((c) => c.categoryId),
      subcategories: store.subcategories.map((sc) => sc.subcategoryId),
    };

    return NextResponse.json({ store: serializedStore }, { status: 200 });
  } catch (error) {
    console.error(`GET /api/stores/[id] Error:`, error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const authError = await checkAdminAuth();
    if (authError) {
      return NextResponse.json({ message: authError.error }, { status: authError.status });
    }

    const { id } = await params;
    const data = await request.json();

    const currentStore = await prisma.store.findUnique({
      where: { id },
    });
    if (!currentStore) {
      return NextResponse.json({ message: "Store not found" }, { status: 404 });
    }

    // Check slug conflict
    if (data.slug && data.slug !== currentStore.slug) {
      const existingStore = await prisma.store.findFirst({
        where: {
          slug: data.slug,
          NOT: { id },
        },
      });
      if (existingStore) {
        return NextResponse.json(
          { message: "A store with this slug already exists." },
          { status: 409 }
        );
      }
    }

    // If logo changed, delete old image from Supabase
    const oldLogoPath = currentStore.logoStoragePath || currentStore.logoPublicId;
    const newLogoPath = data.logoStoragePath || data.logoPublicId;
    if (oldLogoPath && newLogoPath && oldLogoPath !== newLogoPath) {
      await deleteFromSupabase("store-images", oldLogoPath);
    }

    const {
      categories,
      subcategories,
      id: _bodyId,
      _id,
      createdAt,
      updatedAt,
      coupons,
      ...storeFields
    } = data;

    // Use transaction to update store and join tables
    const updatedStore = await prisma.$transaction(async (tx) => {
      if (Array.isArray(categories)) {
        await tx.storeCategory.deleteMany({ where: { storeId: id } });
        if (categories.length > 0) {
          await tx.storeCategory.createMany({
            data: categories.map((catId) => ({ storeId: id, categoryId: catId })),
          });
        }
      }

      if (Array.isArray(subcategories)) {
        await tx.storeSubcategory.deleteMany({ where: { storeId: id } });
        if (subcategories.length > 0) {
          await tx.storeSubcategory.createMany({
            data: subcategories.map((subId) => ({ storeId: id, subcategoryId: subId })),
          });
        }
      }

      return tx.store.update({
        where: { id },
        data: {
          ...storeFields,
          logoStoragePath: newLogoPath || currentStore.logoStoragePath,
        },
        include: {
          categories: { select: { categoryId: true } },
          subcategories: { select: { subcategoryId: true } },
        },
      });
    }, {
      maxWait: 10000,
      timeout: 15000,
    });

    const serializedStore = {
      ...updatedStore,
      _id: updatedStore.id,
      categories: updatedStore.categories.map((c) => c.categoryId),
      subcategories: updatedStore.subcategories.map((sc) => sc.subcategoryId),
    };

    return NextResponse.json({ store: serializedStore }, { status: 200 });
  } catch (error) {
    console.error(`PUT /api/stores/[id] Error:`, error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const authError = await checkAdminAuth();
    if (authError) {
      return NextResponse.json({ message: authError.error }, { status: authError.status });
    }

    const { id } = await params;

    const storeToDelete = await prisma.store.findUnique({
      where: { id },
    });

    if (!storeToDelete) {
      return NextResponse.json({ message: "Store not found" }, { status: 404 });
    }

    const logoPath = storeToDelete.logoStoragePath || storeToDelete.logoPublicId;
    if (logoPath) {
      await deleteFromSupabase("store-images", logoPath);
    }

    await prisma.store.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Store deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error(`DELETE /api/stores/[id] Error:`, error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
