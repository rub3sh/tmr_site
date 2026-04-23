import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await req.json();

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
  }

  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const category = await prisma.blogCategory.update({
    where: { id: params.categoryId },
    data: { name: name.trim(), slug },
  });

  return NextResponse.json(category);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const postCount = await prisma.blogPost.count({
    where: { categoryId: params.categoryId },
  });

  if (postCount > 0) {
    return NextResponse.json(
      { error: `Cannot delete — ${postCount} post(s) still use this category. Reassign them first.` },
      { status: 400 }
    );
  }

  await prisma.blogCategory.delete({ where: { id: params.categoryId } });

  return NextResponse.json({ success: true });
}
