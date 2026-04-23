'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Pencil, Check, X, Loader2, Tag } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { posts: number };
}

export function BlogCategories({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    setError('');

    const res = await fetch('/api/admin/blog/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Failed to add');
    } else {
      setNewName('');
    }

    setAdding(false);
    router.refresh();
  }

  async function handleRename(id: string) {
    if (!editName.trim()) return;
    setError('');

    const res = await fetch(`/api/admin/blog/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim() }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Failed to rename');
    }

    setEditingId(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError('');

    const res = await fetch(`/api/admin/blog/categories/${id}`, { method: 'DELETE' });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Failed to delete');
    }

    setDeletingId(null);
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Tag size={16} className="text-white/30" />
        <h2 className="text-sm font-semibold text-white">Categories</h2>
      </div>

      {/* Category list */}
      <div className="space-y-1">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-white/[0.03]"
          >
            {editingId === cat.id ? (
              <>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename(cat.id);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  className="flex-1 rounded border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-white outline-none focus:border-white/20"
                  autoFocus
                />
                <button
                  onClick={() => handleRename(cat.id)}
                  className="rounded p-1 text-green-400/60 transition hover:bg-green-500/10 hover:text-green-400"
                >
                  <Check size={13} />
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="rounded p-1 text-white/30 transition hover:bg-white/5 hover:text-white/50"
                >
                  <X size={13} />
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-xs text-white/60">{cat.name}</span>
                <span className="text-[10px] text-white/20">{cat._count.posts} posts</span>
                <button
                  onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                  className="rounded p-1 text-white/20 transition hover:bg-white/5 hover:text-white/40"
                  title="Rename"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  disabled={deletingId === cat.id}
                  className="rounded p-1 text-red-400/30 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                  title="Delete"
                >
                  {deletingId === cat.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Trash2 size={12} />
                  )}
                </button>
              </>
            )}
          </div>
        ))}

        {categories.length === 0 && (
          <p className="py-3 text-center text-xs text-white/20">No categories yet</p>
        )}
      </div>

      {/* Add category */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
          className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white placeholder-white/20 outline-none transition focus:border-white/20"
        />
        <button
          type="submit"
          disabled={adding || !newName.trim()}
          className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/15 disabled:opacity-40"
        >
          {adding ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
          Add
        </button>
      </form>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
