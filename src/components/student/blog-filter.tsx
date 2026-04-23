'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Calendar, Clock } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  thumbnailUrl: string | null;
  readTime: string | null;
  format: string | null;
  createdAt: Date;
}

interface BlogFilterProps {
  posts: Post[];
  categories: string[];
}

export function BlogFilter({ posts, categories }: BlogFilterProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
      const matchesSearch =
        searchQuery === '' ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [posts, activeCategory, searchQuery]);

  const allCategories = ['All', ...categories];

  return (
    <>
      {/* Search */}
      <div className="mx-auto max-w-lg">
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3">
          <Search className="h-4 w-4 text-white/30" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              activeCategory === cat
                ? 'bg-white text-black'
                : 'border border-white/10 bg-transparent text-white/40 hover:border-white/20 hover:text-white/60'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Article grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <Link
              href={`/student/blog/${post.slug}`}
              className="group block overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] transition-all hover:border-white/10"
            >
              {post.thumbnailUrl ? (
                <div className="aspect-[16/10] w-full overflow-hidden">
                  <img
                    src={post.thumbnailUrl}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="flex aspect-[16/10] w-full items-center justify-center bg-gradient-to-br from-white/[0.03] to-transparent">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/10">
                    {post.category}
                  </span>
                </div>
              )}

              <div className="p-5">
                <h3 className="text-sm font-bold text-white transition-colors group-hover:text-[var(--accent)]">
                  {post.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-white/35 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="mt-3 flex items-center gap-3 text-[11px] text-white/25">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  {post.readTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  )}
                  {post.format && (
                    <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px]">{post.format}</span>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-white/25">No articles found.</p>
      )}
    </>
  );
}
