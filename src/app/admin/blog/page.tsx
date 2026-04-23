import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { FileText, Plus, Eye, EyeOff } from 'lucide-react';
import { BlogDeleteButton } from '@/components/admin/blog-delete-button';
import { BlogCategories } from '@/components/admin/blog-categories';

async function getPosts() {
  return prisma.blogPost.findMany({
    include: { category: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

async function getCategories() {
  return prisma.blogCategory.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { posts: true } } },
  });
}

export default async function AdminBlogPage() {
  let posts: Awaited<ReturnType<typeof getPosts>> = [];
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  try {
    [posts, categories] = await Promise.all([getPosts(), getCategories()]);
  } catch {
    // DB not ready
  }

  const published = posts.filter((p) => p.isPublished).length;
  const drafts = posts.length - published;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">Blog / Market Education</h1>
          <p className="mt-1 text-sm text-white/40">
            {posts.length} posts — {published} published, {drafts} drafts
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
        >
          <Plus size={16} />
          New Post
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Categories sidebar */}
        <div className="lg:col-span-1">
          <BlogCategories categories={categories} />
        </div>

        {/* Posts table */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <FileText size={16} className="shrink-0 text-white/20" />
                          <div>
                            <p className="font-medium text-white">{post.title}</p>
                            <p className="text-[11px] text-white/25 line-clamp-1">{post.excerpt}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/50">
                          {post.category.name}
                        </span>
                      </td>
                      <td>
                        {post.isPublished ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-400">
                            <Eye size={10} /> Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-400">
                            <EyeOff size={10} /> Draft
                          </span>
                        )}
                      </td>
                      <td className="text-xs text-white/30">
                        {new Date(post.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/blog/${post.id}`}
                            className="rounded px-2 py-1 text-xs text-white/40 transition hover:bg-white/5 hover:text-white/70"
                          >
                            Edit
                          </Link>
                          <BlogDeleteButton postId={post.id} title={post.title} />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {posts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <FileText size={32} className="mx-auto text-white/10" />
                        <p className="mt-2 text-sm text-white/20">No blog posts yet</p>
                        <Link
                          href="/admin/blog/new"
                          className="mt-3 inline-block text-xs text-white/30 transition hover:text-white/50"
                        >
                          Create your first post
                        </Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
