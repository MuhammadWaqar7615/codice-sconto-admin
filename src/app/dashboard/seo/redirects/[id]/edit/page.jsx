import { requireRole } from "@/lib/auth/auth";
import { ROLES } from "@/lib/auth/roles";
import connectMongo from "@/lib/mongodb";
import Redirect from "@/models/Redirect";
import RedirectForm from "@/components/admin/seo/RedirectForm";

export const metadata = { title: "Edit Redirect | CodiceSconto Admin" };

export default async function EditRedirectPage({ params }) {
  await requireRole([ROLES.ADMIN, ROLES.ADMINISTRATION]);
  const { id } = await params;

  await connectMongo();
  const redirect = await Redirect.findById(id).lean();

  if (!redirect) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          Redirect not found.
        </div>
      </main>
    );
  }

  return <RedirectForm redirect={{ ...redirect, _id: redirect._id.toString() }} />;
}
