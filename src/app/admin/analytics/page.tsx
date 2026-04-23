import { prisma } from '@/lib/prisma';
import { TrendingUp, Users, BookOpen, Clock, CheckCircle, CreditCard } from 'lucide-react';

function formatINR(paise: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(paise / 100);
}

async function getDetailedAnalytics() {
  const [users, courses, subscriptions, purchases, progress] = await Promise.all([
    prisma.user.findMany({ where: { role: 'STUDENT' }, select: { createdAt: true, verificationStatus: true } }),
    prisma.course.findMany({ select: { id: true, title: true, _count: { select: { purchases: true } } } }),
    prisma.subscription.findMany({ select: { status: true, billingCycle: true, plan: { select: { priceMonthly: true, priceYearly: true } } } }),
    prisma.purchase.findMany({ where: { status: 'COMPLETED' }, select: { amountInPaise: true, createdAt: true } }),
    prisma.videoProgress.findMany({ select: { completed: true, watchedSec: true } }),
  ]);

  const totalRevenue = purchases.reduce((s, p) => s + p.amountInPaise, 0);
  const mrr = subscriptions
    .filter((s) => s.status === 'ACTIVE')
    .reduce((s, sub) => s + (sub.billingCycle === 'MONTHLY' ? sub.plan.priceMonthly : Math.round(sub.plan.priceYearly / 12)), 0);

  const completedVideos = progress.filter((p) => p.completed).length;
  const totalWatchSec = progress.reduce((s, p) => s + p.watchedSec, 0);

  const topCourses = courses
    .sort((a, b) => b._count.purchases - a._count.purchases)
    .slice(0, 5);

  return {
    totalStudents: users.length,
    verifiedStudents: users.filter((u) => u.verificationStatus === 'VERIFIED').length,
    totalCourses: courses.length,
    activeSubscriptions: subscriptions.filter((s) => s.status === 'ACTIVE').length,
    totalRevenue,
    mrr,
    completedVideos,
    totalWatchHours: Math.round(totalWatchSec / 3600),
    completionRate: progress.length > 0 ? Math.round((completedVideos / progress.length) * 100) : 0,
    topCourses,
  };
}

export default async function AdminAnalyticsPage() {
  let analytics: Awaited<ReturnType<typeof getDetailedAnalytics>>;
  try {
    analytics = await getDetailedAnalytics();
  } catch {
    analytics = {
      totalStudents: 0, verifiedStudents: 0, totalCourses: 0, activeSubscriptions: 0,
      totalRevenue: 0, mrr: 0, completedVideos: 0, totalWatchHours: 0, completionRate: 0, topCourses: [],
    };
  }

  const stats = [
    { label: 'Total Students', value: analytics.totalStudents, icon: Users },
    { label: 'Verified', value: analytics.verifiedStudents, icon: CheckCircle },
    { label: 'Active Subs', value: analytics.activeSubscriptions, icon: CreditCard },
    { label: 'Total Revenue', value: formatINR(analytics.totalRevenue), icon: TrendingUp },
    { label: 'MRR', value: formatINR(analytics.mrr), icon: TrendingUp },
    { label: 'Courses', value: analytics.totalCourses, icon: BookOpen },
    { label: 'Watch Time', value: `${analytics.totalWatchHours}h`, icon: Clock },
    { label: 'Completion', value: `${analytics.completionRate}%`, icon: CheckCircle },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-white">Analytics</h1>
        <p className="mt-1 text-sm text-white/40">Detailed platform analytics</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-white/30">{stat.label}</span>
                <Icon size={16} className="text-white/15" />
              </div>
              <p className="mt-2 text-2xl font-bold text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Top Courses */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
        <h2 className="mb-4 font-heading text-lg font-semibold text-white">Top Courses by Students</h2>
        <div className="space-y-3">
          {analytics.topCourses.map((course, i) => (
            <div key={course.id} className="flex items-center justify-between rounded-lg border border-white/[0.03] bg-white/[0.01] p-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white/30">#{i + 1}</span>
                <span className="text-sm text-white">{course.title}</span>
              </div>
              <span className="text-sm font-medium text-white/50">{course._count.purchases} students</span>
            </div>
          ))}
          {analytics.topCourses.length === 0 && (
            <p className="text-sm text-white/20">No course data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
