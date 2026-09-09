import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/auth";
import { ROLES } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";
import SliderForm from "@/components/admin/sliders/SliderForm";

export const metadata = { title: "Edit Slider | CodiceSconto Admin" };

export default async function EditSliderPage({ params }) {
  await requireRole([ROLES.ADMIN, ROLES.ADMINISTRATION]);
  const { id } = await params;
  const slider = await prisma.slider.findUnique({
    where: { id },
  });
  if (!slider) notFound();

  return (
    <SliderForm
      slider={{
        ...slider,
        _id: slider.id,
        status: slider.status ? slider.status.toLowerCase() : "enabled",
      }}
    />
  );
}
