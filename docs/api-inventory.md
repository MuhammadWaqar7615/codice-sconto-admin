# Public Site API Route Inventory (Read-Only Endpoints)

This document provides a comprehensive audit of all read-only API endpoints required by the public site (`codice-sconto-clone`). The public site consumes data via `GET` requests without authentication or upload capabilities.

---

## Summary Matrix

| Endpoint | Method | Purpose | Legacy Mongoose Model(s) | Migrated Prisma Equivalent | Status / Migration Notes |
|---|---|---|---|---|---|
| `/api/stores` | `GET` | List all active stores (supports letter filter `#` or `a-z`, search query, active flag) | `Store` | `prisma.store.findMany({ where, orderBy: { name: 'asc' }, include: { categories: true, subcategories: true } })` | Fully implemented with Prisma. Public calls query `isActive: true`. |
| `/api/stores/[id]` or `[slug]` | `GET` | Fetch single store by ID or unique slug with categories and subcategories | `Store` | `prisma.store.findUnique({ where: { slug } or { id }, include: { categories: true, subcategories: true } })` | Currently implemented for `id` parameter. Support slug lookup for public SEO URLs. |
| `/api/stores/[id]/coupons` | `GET` | Fetch all active coupons belonging to a specific store | `Coupon` | `prisma.coupon.findMany({ where: { storeId: id, isActive: true }, orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }] })` | Fully implemented with Prisma in admin; public queries require `isActive: true` filter. |
| `/api/coupons` | `GET` | Fetch list of active coupons (supports `storeId`, `featured`, `homepageSection`) | `Coupon` | `prisma.coupon.findMany({ where: { isActive: true }, include: { store: { select: { id: true, name: true, slug: true, logoPath: true } } }, orderBy: { createdAt: 'desc' } })` | Must ensure public `GET` does not enforce admin auth guard (`requireRole`). |
| `/api/coupons/[id]` | `GET` | Fetch single coupon detail by ID with associated store information | `Coupon` | `prisma.coupon.findUnique({ where: { id }, include: { store: { select: { id: true, name: true, slug: true, logoPath: true } } } })` | Fully implemented with Prisma in `coupons/[id]/route.js`. |
| `/api/categories` | `GET` | List categories (supports `status=enabled`, `showInMenu=true`) | `Category` | `prisma.category.findMany({ where: { status: 'ENABLED' }, orderBy: { title: 'asc' }, include: { subcategories: true } })` | Fully implemented with Prisma in `categories/route.js`. |
| `/api/categories/[id]` or `[slug]` | `GET` | Fetch single category detail with subcategories | `Category` | `prisma.category.findUnique({ where: { slug } or { id }, include: { subcategories: true } })` | Fully implemented with Prisma for `id`; support slug lookup for public SEO. |
| `/api/subcategories` | `GET` | List subcategories (supports `status=enabled`, `parentCategory` filter) | `Subcategory` | `prisma.subcategory.findMany({ where: { status: 'ENABLED' }, include: { parentCategory: true }, orderBy: { title: 'asc' } })` | Fully implemented with Prisma in `subcategories/route.js`. |
| `/api/subcategories/[id]` | `GET` | Fetch single subcategory detail | `Subcategory` | `prisma.subcategory.findUnique({ where: { id }, include: { parentCategory: true } })` | Fully implemented with Prisma in `subcategories/[id]/route.js`. |
| `/api/search` | `GET` | Live multi-entity search for active stores and coupons | `Store`, `Coupon` | `Promise.all([prisma.store.findMany({ where: { name: { contains: q, mode: 'insensitive' }, isActive: true }, take: 5 }), prisma.coupon.findMany({ where: { OR: [...], isActive: true }, take: 5 })])` | Fully implemented with Prisma in `search/route.js`. |
| `/api/sliders` | `GET` | Fetch active homepage hero sliders (supports `status=enabled`, `featured=true`) | `Slider` | `prisma.slider.findMany({ where: { status: 'ENABLED' }, orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }] })` | Fully implemented with Prisma in `sliders/route.js`. Public read without auth. |
| `/api/promo-banners` | `GET` | Fetch active promotional banners | `PromoBanner` | `prisma.promoBanner.findMany({ where: { status: 'ENABLED' }, orderBy: { createdAt: 'desc' } })` | Fully implemented with Prisma in `promo-banners/route.js`. Public read without auth. |
| `/api/blog` | `GET` | Fetch published blog posts (supports `status=enabled`) | `BlogPost` | `prisma.blogPost.findMany({ where: { status: 'ENABLED' }, orderBy: { createdAt: 'desc' } })` | Fully implemented with Prisma in `blog/route.js`. Public read without auth. |
| `/api/blog/[id]` or `[slug]` | `GET` | Fetch single published blog post by ID or title slug | `BlogPost` | `prisma.blogPost.findUnique({ where: { id } })` | Fully implemented with Prisma for `id`. |
| `/api/features` | `GET` | Public endpoint delivering active, currently valid featured coupons with store details | `Coupon`, `Store` | `prisma.coupon.findMany({ where: { isActive: true, isFeatured: true, startsAt/expiresAt validity }, include: { store: true } })` | Fully implemented with Prisma in `features/route.js` (`force-dynamic`). |
| `/api/badges` | `GET` | Fetch trust/brand badges displayed in hero scroll container | `Badge` | `prisma.badge.findMany({ orderBy: { name: 'asc' } })` | Fully implemented with Prisma in `badges/route.js`. Public read without auth. |
| `/api/translations` | `GET` | Fetch global translation dictionary (English keys with Italian overrides) | `Translation` | `prisma.translation.findMany({ orderBy: { key: 'asc' } })` merged with `translationDefaults` | Implemented in `translations/route.js`; public site access requires removing `requireAdmin()` on `GET`. |
| `/api/theme` | `GET` | Fetch site color scheme, logos, and header/home layout styles | `Theme` | `prisma.theme.findFirst()` merged with default theme values | Implemented in `theme/route.js`; public site access requires removing `requireAdmin()` on `GET`. |
| `/api/settings` | `GET` | Fetch public site settings (currency symbol, company info, maintenance mode) | `SiteSettings` | `prisma.siteSettings.findFirst()` with sanitized/redacted secrets | Implemented in `settings/route.js`; public site access requires removing `requireAdmin()` on `GET`. |
| `/api/seo/sitemap` | `GET` | Generate dynamic XML sitemap conforming to sitemap protocol | `SitemapConfig`, `Store`, `Category`, `BlogPost`, `SeoPage` | Direct Prisma queries across active entities returning XML `NextResponse` | Fully implemented with Prisma; public read with 1-hour cache. |
| `/api/seo/robots` | `GET` | Generate dynamic `robots.txt` output | `RobotsConfig` | `prisma.robotsConfig.findFirst()` | Fully implemented in `seo/robots/route.js`. |

---

## Detailed Endpoint Specifications

### 1. `/api/stores`
- **Method**: `GET`
- **Query Parameters**:
  - `active` (`"true"` | `"false"`) – defaults to all or `true` on public site
  - `search` (string) – partial case-insensitive store name match
  - `letter` (`"#" | "a" ... "z"`) – alphabetical directory filter
- **Legacy Mongoose Query**:
  ```javascript
  await Store.find({ isActive: true }).sort({ name: 1 }).lean();
  ```
- **Prisma Equivalent**:
  ```javascript
  const stores = await prisma.store.findMany({
    where: {
      isActive: true,
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
      ...(letter === "#"
        ? { AND: "abcdefghijklmnopqrstuvwxyz".split("").map((char) => ({ NOT: { name: { startsWith: char, mode: "insensitive" } } })) }
        : letter ? { name: { startsWith: letter, mode: "insensitive" } } : {}),
    },
    orderBy: { name: "asc" },
    include: {
      categories: { select: { categoryId: true } },
      subcategories: { select: { subcategoryId: true } },
    },
  });
  ```
- **Serialization**: Returns `{ stores: serializedStores }` where each store includes `_id: s.id`, `categories: s.categories.map(c => c.categoryId)`.

---

### 2. `/api/coupons`
- **Method**: `GET`
- **Query Parameters**:
  - `storeId` (string) – filter by specific store ID
  - `featured` (`"true"` | `"false"`) – filter featured offers
  - `section` (`"featured"` | `"secondary"` | `"new"` | `"expiring"`)
- **Legacy Mongoose Query**:
  ```javascript
  await Coupon.find({ isActive: true }).populate("storeId").sort({ createdAt: -1 }).lean();
  ```
- **Prisma Equivalent**:
  ```javascript
  const now = new Date();
  const coupons = await prisma.coupon.findMany({
    where: {
      isActive: true,
      ...(storeId ? { storeId } : {}),
      OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] }],
    },
    include: {
      store: {
        select: { id: true, name: true, slug: true, logoPath: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  ```

---

### 3. `/api/categories`
- **Method**: `GET`
- **Query Parameters**:
  - `status` (`"enabled"` | `"disabled"`)
  - `showInMenu` (`"true"` | `"false"`)
- **Legacy Mongoose Query**:
  ```javascript
  await Category.find({ status: "enabled" }).sort({ title: 1 }).lean();
  ```
- **Prisma Equivalent**:
  ```javascript
  const categories = await prisma.category.findMany({
    where: {
      status: "ENABLED",
      ...(showInMenu ? { showInMenu: showInMenu === "true" } : {}),
    },
    include: {
      subcategories: {
        where: { status: "ENABLED" },
        select: { id: true, title: true, slug: true },
      },
    },
    orderBy: { title: "asc" },
  });
  ```

---

### 4. `/api/search`
- **Method**: `GET`
- **Query Parameters**:
  - `q` (string, min length: 2)
- **Legacy Mongoose Query**:
  ```javascript
  const stores = await Store.find({ name: { $regex: q, $options: "i" }, isActive: true }).limit(5).lean();
  const coupons = await Coupon.find({ $or: [{ title: regex }, { description: regex }], isActive: true }).populate("storeId").limit(5).lean();
  ```
- **Prisma Equivalent**:
  ```javascript
  const [stores, coupons] = await Promise.all([
    prisma.store.findMany({
      where: { name: { contains: q, mode: "insensitive" }, isActive: true },
      select: { id: true, name: true, slug: true, logoPath: true },
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
      include: { store: { select: { id: true, name: true, slug: true, logoPath: true } } },
      take: 5,
    }),
  ]);
  ```

---

### 5. `/api/features`
- **Method**: `GET` (Dynamic)
- **Purpose**: High-performance delivery of active homepage deals and verified offers.
- **Prisma Equivalent**:
  ```javascript
  const now = new Date();
  const coupons = await prisma.coupon.findMany({
    where: {
      isActive: true,
      isFeatured: true,
      OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] }],
    },
    include: {
      store: { select: { id: true, name: true, slug: true, logoPath: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  ```
