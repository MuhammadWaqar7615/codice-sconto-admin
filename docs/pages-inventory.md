# Public Site Server Components (Pages) Inventory

This inventory documents all public-facing pages, server components, and dynamic route handlers across the public site (`codice-sconto-clone` / `condice-sconto-site-clone`). It outlines the data dependencies, the legacy Mongoose queries, and their exact Prisma ORM equivalents.

---

## Public Page Routing Matrix

| Public Route | Route Type | Data Dependencies | Legacy Mongoose Model(s) | Migrated Prisma Equivalent |
|---|---|---|---|---|
| `/` | Hybrid Server/Client | Hero sliders, trust badges, featured mosaic coupons, secondary offers, promo banner, category list | `Slider`, `Badge`, `Coupon`, `PromoBanner`, `Category` | Client components fetch from `/api/sliders`, `/api/badges`, `/api/features`, `/api/promo-banners`, `/api/categories` or SSR queries via Prisma |
| `/negozi` (`/stores`) | Server Component (`page.jsx`) + Client (`NegoziClient.jsx`) | All active stores with name, slug, logoPath sorted alphabetically | `Store` | `prisma.store.findMany({ where: { isActive: true }, select: { id: true, name: true, slug: true, logoPath: true }, orderBy: { name: 'asc' } })` |
| `/store/[slug]` (`/stores/[slug]`) | Server Component (`page.js`) | Store profile, category links, and all active/valid coupons for the store | `Store`, `Coupon` | `prisma.store.findUnique({ where: { slug }, include: { categories: { include: { category: true } }, coupons: { where: { isActive: true, validity checks }, orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }] } } })` |
| `/offerte` (`/coupons`) | Server Component (`page.js`) | All enabled categories with their nested subcategories | `Category`, `Subcategory` | `prisma.category.findMany({ where: { status: 'ENABLED' }, include: { subcategories: { where: { status: 'ENABLED' } } }, orderBy: { title: 'asc' } })` |
| `/offerte/[categorySlug]` (`/categories/[slug]`) | Server Component (`page.js`) | Category metadata, associated stores, and active coupons belonging to those stores | `Category`, `Store`, `Coupon` | Find category by slug, then query active stores via `StoreCategory` join table, then fetch active coupons for those store IDs with store details |
| `/offerte/[categorySlug]/[subcategorySlug]` | Server Component (`page.js`) | Subcategory metadata, parent category verification, stores in subcategory, active coupons | `Category`, `Subcategory`, `Store`, `Coupon` | Find subcategory by slug & parent ID, query stores via `StoreSubcategory` join table, fetch active coupons for those store IDs |
| `/blog` | Server Component (`page.js`) | All published blog posts ordered by latest date (`featuredPost` + `gridPosts`) | `BlogPost` | `prisma.blogPost.findMany({ where: { status: 'ENABLED' }, orderBy: { createdAt: 'desc' } })` |
| `/blog/[slug]` | Server Component (`page.js`) | Single blog post article by slug/ID with SEO tags and recent related posts | `BlogPost` | `prisma.blogPost.findFirst({ where: { status: 'ENABLED', ... } })` and `findMany({ take: 3 })` for sidebar |
| `/cerca` (`/search`) | Client / Server Component | Real-time search results matching keyword query across stores and coupons | `Store`, `Coupon` | Consumes `/api/search?q={query}` or executes direct Prisma search with insensitive mode |
| `/aggiungi-negozio` | Static Server Component | Explanatory informational page and submission instructions | None (Static) | Static component, no direct database queries required |

---

## Detailed Page Implementations & Prisma Queries

### 1. Homepage (`/` - `src/app/page.js`)
- **Rendering Model**: Server Component composition with revalidation (`export const revalidate = 60`).
- **Data Fetched**:
  - Hero sliders (`Slider` where `status: "ENABLED"`)
  - Badges (`Badge` list)
  - Featured deals (`Coupon` where `isActive: true`, `isFeatured: true`)
  - Category menu (`Category` where `showInMenu: true`)
  - Promotional banners (`PromoBanner` where `status: "ENABLED"`)
- **Mongoose vs Prisma**:
  - *Mongoose*: Multiple parallel REST fetch calls from client components or individual Mongoose calls.
  - *Prisma (Server-Side)*:
    ```javascript
    const [sliders, badges, featuredCoupons, promoBanner] = await Promise.all([
      prisma.slider.findMany({ where: { status: "ENABLED" }, orderBy: [{ featured: "desc" }, { createdAt: "desc" }] }),
      prisma.badge.findMany({ orderBy: { name: "asc" } }),
      prisma.coupon.findMany({
        where: { isActive: true, isFeatured: true },
        include: { store: { select: { id: true, name: true, slug: true, logoPath: true } } },
        orderBy: { createdAt: "desc" },
        take: 12,
      }),
      prisma.promoBanner.findFirst({ where: { status: "ENABLED" }, orderBy: { createdAt: "desc" } }),
    ]);
    ```

---

### 2. Store Directory (`/negozi` - `src/app/negozi/page.jsx`)
- **Rendering Model**: Server Component passing plain serialized store array to `<NegoziClient stores={stores} />`.
- **Legacy Mongoose Query**:
  ```javascript
  await connectMongo();
  const rawStores = await Store.find({ isActive: { $ne: false } })
    .select("name slug logoPath")
    .sort({ name: 1 })
    .lean();
  const stores = rawStores.map(store => ({
    _id: store._id.toString(),
    name: store.name,
    slug: store.slug,
    logoPath: store.logoPath
  }));
  ```
- **Prisma Equivalent**:
  ```javascript
  import { prisma } from "@/lib/prisma";

  const rawStores = await prisma.store.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true, logoPath: true },
    orderBy: { name: "asc" },
  });

  const stores = rawStores.map(store => ({
    _id: store.id,
    id: store.id,
    name: store.name,
    slug: store.slug,
    logoPath: store.logoPath,
  }));
  ```

---

### 3. Store Detail Page (`/store/[slug]` - `src/app/store/[slug]/page.js`)
- **Rendering Model**: Dynamic Server Component with `generateMetadata`.
- **Data Fetched**:
  1. Store profile by `slug`
  2. Active coupons for that store with date validity (`startsAt <= now` and `expiresAt > now`)
- **Legacy Mongoose Query**:
  ```javascript
  await connectMongo();
  const store = await Store.findOne({ slug: decodedSlug, isActive: true }).lean();
  const couponsRaw = await Coupon.find({
    storeId: store._id,
    isActive: true,
    $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: now } }]
  }).lean();
  ```
- **Prisma Equivalent**:
  ```javascript
  import { prisma } from "@/lib/prisma";
  import { notFound } from "next/navigation";

  const now = new Date();
  const store = await prisma.store.findUnique({
    where: { slug: decodedSlug },
    include: {
      categories: {
        include: { category: { select: { id: true, title: true, slug: true } } },
      },
      coupons: {
        where: {
          isActive: true,
          OR: [{ startsAt: null }, { startsAt: { lte: now } }],
          AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] }],
        },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      },
    },
  });

  if (!store || !store.isActive) notFound();

  // Project _id compatibility
  const serializedStore = {
    ...store,
    _id: store.id,
    coupons: store.coupons.map(c => ({
      ...c,
      _id: c.id,
      type: c.type.toLowerCase(),
      storeId: store.id,
      store: { _id: store.id, name: store.name, slug: store.slug, logoPath: store.logoPath }
    })),
  };
  ```

---

### 4. Categories & Offers Hub (`/offerte` - `src/app/offerte/page.js`)
- **Rendering Model**: Server Component grouping subcategories under parent categories.
- **Legacy Mongoose Query**:
  ```javascript
  await connectMongo();
  const rawCategories = await Category.find({ status: "enabled" }).sort({ title: 1 }).lean();
  const rawSubcategories = await Subcategory.find({ status: "enabled" }).lean();
  // Filter and attach subs in memory
  ```
- **Prisma Equivalent**:
  ```javascript
  import { prisma } from "@/lib/prisma";

  const rawCategories = await prisma.category.findMany({
    where: { status: "ENABLED" },
    include: {
      subcategories: {
        where: { status: "ENABLED" },
        orderBy: { title: "asc" },
      },
    },
    orderBy: { title: "asc" },
  });

  const categories = rawCategories.map(cat => ({
    ...cat,
    _id: cat.id,
    subs: cat.subcategories.map(sub => ({ ...sub, _id: sub.id })),
  }));
  ```

---

### 5. Category Offers Page (`/offerte/[categorySlug]` - `src/app/offerte/[categorySlug]/page.js`)
- **Rendering Model**: Server Component fetching category info, connected stores, and store coupons.
- **Legacy Mongoose Query**:
  ```javascript
  const category = await Category.findOne({ slug: categorySlug, status: "enabled" }).lean();
  const stores = await Store.find({ categories: category._id, isActive: true }).lean();
  const coupons = await Coupon.find({ storeId: { $in: storeIds }, isActive: true, ... }).populate("storeId").lean();
  ```
- **Prisma Equivalent (Normalized Join)**:
  ```javascript
  import { prisma } from "@/lib/prisma";
  import { notFound } from "next/navigation";

  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
  });

  if (!category || category.status !== "ENABLED") notFound();

  // Find stores via join table
  const storeCategories = await prisma.storeCategory.findMany({
    where: { categoryId: category.id, store: { isActive: true } },
    select: { storeId: true },
  });
  const storeIds = storeCategories.map(sc => sc.storeId);

  const now = new Date();
  const coupons = await prisma.coupon.findMany({
    where: {
      storeId: { in: storeIds },
      isActive: true,
      OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] }],
    },
    include: {
      store: { select: { id: true, name: true, slug: true, logoPath: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const serializedCoupons = coupons.map(c => ({
    ...c,
    _id: c.id,
    storeId: c.store ? { ...c.store, _id: c.store.id } : null,
  }));
  ```

---

### 6. Blog Listing Page (`/blog` - `src/app/blog/page.js`)
- **Rendering Model**: Server Component splitting into featured first post + remaining grid posts.
- **Legacy Mongoose Query**:
  ```javascript
  await connectMongo();
  const allPosts = await BlogPost.find({ status: "enabled" }).sort({ createdAt: -1 }).lean();
  ```
- **Prisma Equivalent**:
  ```javascript
  import { prisma } from "@/lib/prisma";

  const allPosts = await prisma.blogPost.findMany({
    where: { status: "ENABLED" },
    orderBy: { createdAt: "desc" },
  });

  const posts = allPosts.map(p => ({
    ...p,
    _id: p.id,
    status: p.status.toLowerCase(),
  }));

  const featuredPost = posts.length > 0 ? posts[0] : null;
  const gridPosts = posts.length > 1 ? posts.slice(1) : [];
  ```
