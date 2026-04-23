import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const post = await prisma.blogPost.findUnique({
    where: { id: params.postId },
  });

  if (!post) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { title, excerpt, content, categoryId, thumbnailUrl, readTime, format, isPublished } = body;

  const data: Record<string, unknown> = {};
  if (title !== undefined) {
    data.title = title;
    data.slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  if (excerpt !== undefined) data.excerpt = excerpt;
  if (content !== undefined) data.content = content;
  if (categoryId !== undefined) data.categoryId = categoryId;
  if (thumbnailUrl !== undefined) data.thumbnailUrl = thumbnailUrl || null;
  if (readTime !== undefined) data.readTime = readTime || null;
  if (format !== undefined) data.format = format || null;
  if (isPublished !== undefined) data.isPublished = isPublished;

  const post = await prisma.blogPost.update({
    where: { id: params.postId },
    data,
  });

  return NextResponse.json(post);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.blogPost.delete({ where: { id: params.postId } });

  return NextResponse.json({ success: true });
}
