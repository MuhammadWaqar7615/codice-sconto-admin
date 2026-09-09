import Link from "next/link";
import { requireRole } from "@/lib/auth/auth";
import { ROLES } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "SEO Dashboard | CodiceSconto Admin" };

export default async function SeoDashboardPage() {
  await requireRole([ROLES.ADMIN, ROLES.ADMINISTRATION]);

  const [globalSeo, pageSeoCount, activePageSeoCount, redirectCount, activeRedirectCount] = await Promise.all([
    prisma.globalSeo.findFirst(),
    prisma.seoPage.count(),
    prisma.seoPage.count({ where: { isActive: true } }),
    prisma.redirect.count(),
    prisma.redirect.count({ where: { isActive: true } }),
  ]);

  const cards = [
    { label: "Global SEO", value: globalSeo ? "Configured" : "Not set", helper: globalSeo ? "Default metadata ready" : "Needs initial setup" },
    { label: "Page SEO", value: String(pageSeoCount), helper: `${activePageSeoCount} active` },
    { label: "Redirects", value: String(redirectCount), helper: `${activeRedirectCount} active` },
    { label: "Sitemap", value: "Enabled", helper: "XML generation ready" },
  ];

  const quickLinks = [
    { href: "/dashboard/seo/global", label: "Global SEO" },
    { href: "/dashboard/seo/pages", label: "Page SEO" },
    { href: "/dashboard/seo/redirects", label: "Redirects" },
    { href: "/dashboard/seo/sitemap", label: "Sitemap" },
    { href: "/dashboard/seo/robots", label: "Robots.txt" },
  ];

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">SEO Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">Overview of your global SEO configuration, page metadata, redirects, and sitemap health.</p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{card.label}</p>
              <p className="mt-3 text-2xl font-bold text-slate-900">{card.value}</p>
              <p className="mt-2 text-sm text-slate-600">{card.helper}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Quick actions</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white"
                >
                  <p className="text-sm font-semibold text-slate-900">{link.label}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
