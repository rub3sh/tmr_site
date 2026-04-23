'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';

interface BlogDeleteButtonProps {
  postId: string;
  title: string;
}

export function BlogDeleteButton({ postId, title }: BlogDeleteButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    setDeleting(true);
    await fetch(`/api/admin/blog/${postId}`, { method: 'DELETE' });
    setDeleting(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="rounded p-1.5 text-red-400/40 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
      title="Delete"
    >
      {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
    </button>
  );
}
