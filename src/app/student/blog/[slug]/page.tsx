import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';

const BlogContent = dynamic(
  () => import('@/components/student/blog-content').then((mod) => mod.BlogContent),
  { ssr: false, loading: () => <div className="animate-pulse h-96 bg-white/5 rounded-lg" /> }
);

export default async function StudentBlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
    include: { category: { select: { name: true } } },
  });

  if (!post || !post.isPublished) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link
        href="/student/blog"
        className="inline-flex items-center gap-2 text-xs text-white/30 transition hover:text-white/50"
      >
        <ArrowLeft size={14} />
        Back to articles
      </Link>

      <article>
        <header className="space-y-4">
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/40">
            {post.category.name}
          </span>

          <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">
            {post.title}
          </h1>

          <p className="text-sm text-white/40 leading-relaxed">{post.excerpt}</p>

          <div className="flex items-center gap-4 text-xs text-white/25">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            {post.readTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {post.readTime} read
              </span>
            )}
            {post.format && (
              <span className="rounded bg-white/5 px-2 py-0.5">{post.format}</span>
            )}
          </div>
        </header>

        <div className="mt-8 max-w-none">
          <BlogContent content={post.content} />
        </div>
      </article>
    </div>
  );
}
