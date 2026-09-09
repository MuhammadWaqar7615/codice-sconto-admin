import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/auth";
import { ROLES } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";
import BlogPostForm from "@/components/admin/blog/BlogPostForm";

export const metadata = { title: "Edit Blog Post | CodiceSconto Admin" };

export default async function EditBlogPostPage({ params }) {
  await requireRole([ROLES.ADMIN, ROLES.ADMINISTRATION]);
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { id },
  });
  if (!post) notFound();
  return (
    <BlogPostForm
      post={{
        ...post,
        _id: post.id,
        status: post.status ? post.status.toLowerCase() : "enabled",
      }}
    />
  );
}
