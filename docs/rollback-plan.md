# Public Site Rollback & Disaster Recovery Plan

This document outlines the step-by-step procedures for reverting the public site (`codice-sconto-clone`) in the event of unforeseen regressions, database connection failures, or performance degradation during or after migration to PostgreSQL + Supabase Storage.

---

## 1. Trigger Conditions for Rollback

A rollback should be initiated if any of the following occur in staging or production:
1. **Critical Database Downtime**: Prisma connection pool exhaustion (`P2024`), fatal SSL connection errors, or persistent query timeouts exceeding 10 seconds.
2. **Missing Essential Data**: Critical entities (stores, active coupons, categories) fail to render on public pages.
3. **Broken Media Assets**: Store logos or coupon images fail to load globally (HTTP 403/404 from Supabase Storage).
4. **Build Failures**: Next.js production builds fail during static page generation.

---

## 2. Fast Rollback Procedure (Vercel Production)

### Step 1: Instant Deployment Rollback (Zero Downtime)
If the site is deployed on Vercel:
1. Open the [Vercel Dashboard](https://vercel.com).
2. Navigate to the `codice-sconto-clone` project.
3. Go to the **Deployments** tab.
4. Locate the last known good deployment (from the `main` branch before the migration merge).
5. Click the three dots (`...`) next to the deployment and select **Instant Rollback** (or **Promote to Production**).
   - *Result*: Production traffic instantly switches back to the previous deployment build within ~5 seconds.

### Step 2: Revert Environment Variables on Vercel
1. In the Vercel project, go to **Settings → Environment Variables**.
2. If MongoDB Atlas credentials were replaced, re-activate or restore:
   - `MONGODB_URI`: Re-add or enable the MongoDB Atlas connection string.
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Ensure Cloudinary credentials are restored.
3. (Optional) If keeping dual configuration, leave Supabase variables dormant.
4. Trigger a fresh redeploy of the rolled-back deployment if environment variable re-injection is required.

---

## 3. Git & Codebase Rollback Procedure

### Revert the Git Branch
If the `feature/migrate-public-site` branch was merged into `main`:

```bash
# 1. Fetch latest changes
git checkout main
git pull origin main

# 2. Revert the merge commit (or revert individual commits)
git log -n 5 --oneline
# Identify the merge commit hash (e.g. abc1234)
git revert -m 1 <MERGE_COMMIT_HASH> -m "Revert public site migration to Prisma"

# 3. Push the revert to remote
git push origin main
```

### Clean Local Environment
```bash
# Clean next.js build cache and reinstall dependencies
rm -rf .next node_modules
npm install
npm run build
```

---

## 4. Data Layer Recovery & Dual-Write Verification

Because the migration was performed as an ETL (Extract, Transform, Load) process from MongoDB to PostgreSQL:
1. **Source MongoDB Intact**: The original MongoDB Atlas database (`codice_sconto`) was never deleted or mutated in-place. All original collections remain untouched and fully available.
2. **Cloudinary Assets Intact**: Cloudinary assets were migrated via read-only download to Supabase Storage; no files were deleted from Cloudinary during the migration.
3. **PostgreSQL Rollback (If needed)**:
   - If PostgreSQL tables need to be wiped and re-restored from pre-migration state, use the verified backup artifacts in `migration-scripts/`:
     ```bash
     # Restore verified dump
     pg_restore -U postgres -d tutti_negozi_migration --clean migration-scripts/tutti_negozi_migrated.dump
     ```

---

## 5. Post-Rollback Validation Checklist

After executing the rollback, verify the following:
- [ ] Homepage (`/`) loads without error.
- [ ] Store listing (`/negozi`) renders all stores.
- [ ] Store detail (`/store/[slug]`) loads store info and active coupons.
- [ ] Category page (`/offerte/[categorySlug]`) loads properly.
- [ ] Media assets load from Cloudinary (or fallback URLs).
- [ ] Vercel deployment status is Green.
