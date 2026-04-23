import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function MarketEducationPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/student/blog');
  }

  redirect('/login?callbackUrl=/student/blog');
}
