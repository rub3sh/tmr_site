import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    include: { category: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const mapped = posts.map((p) => ({
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

  return NextResponse.json(mapped);
}
