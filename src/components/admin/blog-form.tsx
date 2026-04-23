'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
}

interface BlogFormProps {
  post?: {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    categoryId: string;
    thumbnailUrl: string | null;
    readTime: string | null;
    format: string | null;
    isPublished: boolean;
  };
}

export function BlogForm({ post }: BlogFormProps) {
  const router = useRouter();
  const isEdit = !!post;

  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState(post?.title ?? '');
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '');
  const [content, setContent] = useState(post?.content ?? '');
  const [categoryId, setCategoryId] = useState(post?.categoryId ?? '');
  const [thumbnailUrl, setThumbnailUrl] = useState(post?.thumbnailUrl ?? '');
  const [readTime, setReadTime] = useState(post?.readTime ?? '');
  const [format, setFormat] = useState(post?.format ?? '');
  const [isPublished, setIsPublished] = useState(post?.isPublished ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/blog/categories')
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        if (!categoryId && data.length > 0) {
          setCategoryId(data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!categoryId) {
      setError('Please select a category');
      return;
    }

    setSaving(true);

    const body = { title, excerpt, content, categoryId, thumbnailUrl, readTime, format, isPublished };

    const url = isEdit ? `/api/admin/blog/${post.id}` : '/api/admin/blog';
    const method = isEdit ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Failed to save');
      setSaving(false);
      return;
    }

    setSaving(false);
    router.push('/admin/blog');
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/blog"
          className="rounded-lg p-2 text-white/30 transition hover:bg-white/5 hover:text-white/60"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">
            {isEdit ? 'Edit Post' : 'New Post'}
          </h1>
          <p className="mt-1 text-sm text-white/40">
            {isEdit ? 'Update blog post content' : 'Create a new market education article'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content - left 2 cols */}
          <div className="space-y-5 lg:col-span-2">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-white/20"
                  placeholder="Post title"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">
                  Excerpt
                </label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-white/20 resize-none"
                  placeholder="Brief description shown in cards"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">
                  Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={16}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-white/20 resize-y font-mono"
                  placeholder="Write your article content here... (supports markdown)"
                  required
                />
                <p className="mt-1.5 text-[10px] text-white/20">
                  Supports Markdown — use **bold**, *italic*, ## headings, ![alt](url) for images, [text](url) for links
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar - right col */}
          <div className="space-y-5">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">
                  Category
                </label>
                {categories.length > 0 ? (
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-white/20"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-[#0a0a0a]">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-white/30">Loading categories...</p>
                )}
                <Link
                  href="/admin/blog"
                  className="mt-1.5 inline-block text-[10px] text-white/20 transition hover:text-white/40"
                >
                  Manage categories on blog page
                </Link>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">
                  Read Time
                </label>
                <input
                  type="text"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-white/20"
                  placeholder="e.g. 8 min"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">
                  Format
                </label>
                <input
                  type="text"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-white/20"
                  placeholder="e.g. PDF, Video"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">
                  Thumbnail URL
                </label>
                <input
                  type="text"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-white/20"
                  placeholder="https://..."
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setIsPublished(!isPublished)}
                  className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition ${
                    isPublished
                      ? 'border-green-500/20 bg-green-500/5 text-green-400'
                      : 'border-white/10 bg-white/[0.03] text-yellow-400'
                  }`}
                >
                  <span>{isPublished ? 'Published' : 'Draft'}</span>
                  {isPublished ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-center text-sm text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {saving ? 'Saving...' : isEdit ? 'Update Post' : 'Create Post'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
