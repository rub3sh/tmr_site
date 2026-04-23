import { prisma } from '@/lib/prisma';
import {
  Users,
  BookOpen,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
  Trophy,
  Gift,
} from 'lucide-react';

function formatINR(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

async function getAnalytics() {
  const [
    totalUsers,
    totalCourses,
    activePlans,
    activeSubscriptions,
    purchases,
    progressData,
    recentStudents,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.course.count(),
    prisma.plan.count({ where: { isActive: true } }),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.purchase.findMany({
      where: { status: 'COMPLETED' },
      select: { amountInPaise: true },
    }),
    prisma.videoProgress.findMany({
      select: { completed: true, watchedSec: true },
    }),
    prisma.user.findMany({
      where: { role: 'STUDENT' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        studentId: true,
        verificationStatus: true,
        createdAt: true,
        image: true,
      },
    }),
  ]);

  const totalRevenue = purchases.reduce((s, p) => s + p.amountInPaise, 0);
  const totalWatchTimeSec = progressData.reduce((s, p) => s + p.watchedSec, 0);
  const completedVideos = progressData.filter((p) => p.completed).length;
  const completionRate =
    progressData.length > 0
      ? Math.round((completedVideos / progressData.length) * 100)
      : 0;

  return {
    totalUsers,
    totalCourses,
    activePlans,
    activeSubscriptions,
    totalRevenue,
    totalPurchases: purchases.length,
    totalWatchTimeHours: Math.round(totalWatchTimeSec / 3600),
    completionRate,
    recentStudents,
  };
}

export default async function AdminDashboardPage() {
  let analytics: Awaited<ReturnType<typeof getAnalytics>>;
  try {
    analytics = await getAnalytics();
  } catch {
    analytics = {
      totalUsers: 0,
      totalCourses: 0,
      activePlans: 0,
      activeSubscriptions: 0,
      totalRevenue: 0,
      totalPurchases: 0,
      totalWatchTimeHours: 0,
      completionRate: 0,
      recentStudents: [],
    };
  }

  const stats = [
    { label: 'Total Students', value: analytics.totalUsers, icon: Users, color: 'text-white' },
    { label: 'Revenue', value: formatINR(analytics.totalRevenue), icon: CreditCard, color: 'text-white' },
    { label: 'Active Subscriptions', value: analytics.activeSubscriptions, icon: TrendingUp, color: 'text-white' },
    { label: 'Courses', value: analytics.totalCourses, icon: BookOpen, color: 'text-white' },
    { label: 'Watch Time', value: `${analytics.totalWatchTimeHours}h`, icon: Clock, color: 'text-white' },
    { label: 'Completion Rate', value: `${analytics.completionRate}%`, icon: CheckCircle, color: 'text-white' },
    { label: 'Active Plans', value: analytics.activePlans, icon: Trophy, color: 'text-white' },
    { label: 'Purchases', value: analytics.totalPurchases, icon: Gift, color: 'text-white' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-white/40">Platform overview and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="group rounded-xl border border-white/5 bg-white/[0.02] p-5 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-white/30">
                  {stat.label}
                </span>
                <Icon size={16} className="text-white/20" />
              </div>
              <p className="mt-2 text-2xl font-bold text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Students */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
        <h2 className="mb-4 font-heading text-lg font-semibold text-white">
          Recent Students
        </h2>
        {analytics.recentStudents.length === 0 ? (
          <p className="text-sm text-white/30">No students yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Student ID</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        {student.image ? (
                          <img
                            src={student.image}
                            alt=""
                            className="h-8 w-8 rounded-full"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-xs font-medium text-white/50">
                            {student.name?.[0]?.toUpperCase() ?? 'U'}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-white">{student.name ?? 'Unknown'}</p>
                          <p className="text-xs text-white/30">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-xs">{student.studentId ?? '—'}</td>
                    <td>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          student.verificationStatus === 'VERIFIED'
                            ? 'bg-green-500/10 text-green-400'
                            : student.verificationStatus === 'REJECTED'
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-yellow-500/10 text-yellow-400'
                        }`}
                      >
                        {student.verificationStatus}
                      </span>
                    </td>
                    <td className="text-xs">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
