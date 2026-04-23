import { prisma } from '@/lib/prisma';
import { BlogFilter } from '@/components/student/blog-filter';

async function getPublishedPosts() {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    include: { category: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return posts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    category: p.category.name,
    thumbnailUrl: p.thumbnailUrl,
    readTime: p.readTime,
    format: p.format,
    createdAt: p.createdAt,
  }));
}

async function getCategories() {
  const cats = await prisma.blogCategory.findMany({
    where: { posts: { some: { isPublished: true } } },
    select: { name: true },
    orderBy: { sortOrder: 'asc' },
  });
  return cats.map((c) => c.name);
}

export default async function StudentBlogPage() {
  let posts: Awaited<ReturnType<typeof getPublishedPosts>> = [];
  let categories: string[] = [];
  try {
    [posts, categories] = await Promise.all([getPublishedPosts(), getCategories()]);
  } catch {
    // DB not ready
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">
          Trading <span className="text-[var(--accent)]">Education Center</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-white/40">
          Premium trading concepts, strategies, and market insights to build your edge.
        </p>
      </div>

      <BlogFilter posts={posts} categories={categories} />
    </div>
  );
}
