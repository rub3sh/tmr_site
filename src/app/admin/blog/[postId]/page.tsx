import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { BlogForm } from '@/components/admin/blog-form';

export default async function AdminEditBlogPage({
  params,
}: {
  params: { postId: string };
}) {
  const post = await prisma.blogPost.findUnique({
    where: { id: params.postId },
  });

  if (!post) notFound();

  return (
    <BlogForm
      post={{
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        categoryId: post.categoryId,
        thumbnailUrl: post.thumbnailUrl,
        readTime: post.readTime,
        format: post.format,
        isPublished: post.isPublished,
      }}
    />
  );
}
