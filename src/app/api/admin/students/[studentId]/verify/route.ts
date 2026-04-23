import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { studentId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { verificationStatus } = await req.json();

  if (!['PENDING', 'VERIFIED', 'REJECTED'].includes(verificationStatus)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: params.studentId },
    data: { verificationStatus },
  });

  return NextResponse.json({ success: true, data: user });
}
