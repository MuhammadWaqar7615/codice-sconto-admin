# Phase 0 & Phase 1 Manual Verification Checklist

This manual test checklist ensures full regression testing and functional verification of the public site (`codice-sconto-clone`) following the migration from MongoDB + Cloudinary to PostgreSQL + Supabase Storage via Prisma ORM.

---

## 1. Homepage (`/`)
- [ ] **Hero Slider**:
  - [ ] Carousel loads with active slides (`GET /api/sliders?status=enabled`).
  - [ ] Slide images and store logos load successfully from Supabase Storage without 404s.
  - [ ] Auto-play and manual left/right navigation controls cycle correctly.
- [ ] **Trust / Brand Badges Bar**:
  - [ ] Horizontal scroll bar displays badge icons loaded from Supabase (`GET /api/badges`).
  - [ ] Hover and scroll interactions respond smoothly.
- [ ] **Featured Offers (Mosaic Grid)**:
  - [ ] Featured coupon cards render with store logo, discount tag, and description (`GET /api/features`).
  - [ ] Clicking "Mostra Codice" or "Attiva Offerta" opens code modal / redirects to store websiteUrl.
- [ ] **Secondary Offers & Promo Banners**:
  - [ ] Secondary offers section renders with valid coupon expiration countdowns.
  - [ ] Promotional banner image loads from Supabase bucket `coupon-banners`.
- [ ] **Footer & Navigation**:
  - [ ] Global header and footer links navigate properly to `/negozi`, `/offerte`, `/blog`, and `/aggiungi-negozio`.

---

## 2. Store Listing Directory (`/negozi`)
- [ ] **Directory Loading**:
  - [ ] Page renders all active stores without database timeouts or hydration mismatches.
  - [ ] Inactive stores (`isActive: false`) are completely excluded from the public directory.
- [ ] **Alphabetical Filter**:
  - [ ] Clicking letter tabs (`A`, `B`, `C`, etc.) filters stores by starting character.
  - [ ] Clicking `#` correctly groups numeric/special character stores.
- [ ] **Store Cards**:
  - [ ] Store logos load reliably from Supabase Storage `store-images` bucket.
  - [ ] Store name and link point to correct slug `/store/[slug]`.

---

## 3. Store Detail Page (`/store/[slug]`)
- [ ] **Store Profile**:
  - [ ] Correct store logo, name, website link, and description load for the queried `slug`.
  - [ ] Visiting a non-existent slug returns a proper 404 (`notFound()`).
- [ ] **Coupon Cards**:
  - [ ] Active coupons belonging to this store render under the profile.
  - [ ] Expired coupons (`expiresAt <= now`) are hidden from view.
  - [ ] Code coupon (`type: "code"`) reveals the code button.
  - [ ] Link deal (`type: "link"`) routes to the store affiliate/website URL.
- [ ] **SEO Metadata**:
  - [ ] Dynamic `<title>` and `<meta name="description">` match store `seoTitle` / `seoDescription`.

---

## 4. Category Hub & Listings (`/offerte`)
- [ ] **Categories Grid**:
  - [ ] All enabled categories (`status: "ENABLED"`) display with their images.
  - [ ] Nested subcategories are listed under each parent category card.
  - [ ] Subcategory links navigate to `/offerte/[categorySlug]/[subcategorySlug]`.

---

## 5. Category Details (`/offerte/[categorySlug]`)
- [ ] **Header Banner**:
  - [ ] Displays category title, description, and breadcrumbs.
- [ ] **Associated Deals**:
  - [ ] Resolves store associations via `StoreCategory` join table.
  - [ ] Displays active coupon cards for all stores in this category.
  - [ ] Invalid category slug returns 404.

---

## 6. Subcategory Details (`/offerte/[categorySlug]/[subcategorySlug]`)
- [ ] **Hierarchy Verification**:
  - [ ] Verifies subcategory belongs to parent category.
  - [ ] Returns 404 if subcategory slug does not exist under the parent category.
- [ ] **Deals Rendering**:
  - [ ] Resolves stores belonging to the subcategory via `StoreSubcategory`.
  - [ ] Renders coupon cards with store names and logos.

---

## 7. Global Search (`/cerca` and Navbar Live Search)
- [ ] **Live Search Dropdown**:
  - [ ] Typing 2+ characters triggers `GET /api/search?q={term}`.
  - [ ] Shows top 5 matching stores and top 5 matching coupons.
  - [ ] Search is case-insensitive (e.g. `amazon` matches `Amazon`).
- [ ] **Search Results Page**:
  - [ ] Submitting a query renders the dedicated search result view.
  - [ ] Empty state renders friendly "Nessun risultato trovato" message.

---

## 8. Blog (`/blog`)
- [ ] **Featured Post**:
  - [ ] Most recent published article (`status: "ENABLED"`) occupies top featured slot.
  - [ ] Featured image renders cleanly without distortion.
- [ ] **Article Grid**:
  - [ ] Remaining articles render in chronological order in the grid below.
  - [ ] Disabled blog posts (`status: "DISABLED"`) are excluded.

---

## 9. Backward Compatibility & `_id` Layer
- [ ] **Field Identity**:
  - [ ] Ensure all components referencing `item._id` receive string identifiers identical to `item.id`.
  - [ ] No `undefined` errors when accessing `store._id`, `coupon._id`, `category._id`.
- [ ] **Enum Values**:
  - [ ] Status checks expecting lowercase `"enabled"` vs uppercase `"ENABLED"` operate seamlessly.

---

## 10. Performance & Network Verification
- [ ] **Supabase Storage HTTP Status**:
  - [ ] Browser Network tab shows HTTP `200` (or `304 Not Modified`) for all image assets.
  - [ ] Zero requests attempt to reach legacy Cloudinary endpoints (`res.cloudinary.com`).
- [ ] **Database Connection Pool**:
  - [ ] Navigating between pages in rapid succession does not throw Prisma pool timeout errors (`P2024`).
