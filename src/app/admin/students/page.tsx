import { prisma } from '@/lib/prisma';
import { Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { StudentActions } from '@/components/admin/student-actions';

async function getStudents() {
  return prisma.user.findMany({
    where: { role: 'STUDENT' },
    include: {
      subscriptions: {
        include: { plan: true },
        where: { status: 'ACTIVE' },
        take: 1,
      },
      videoProgress: {
        select: { completed: true },
      },
      _count: {
        select: { purchases: true, videoProgress: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function getPlans() {
  return prisma.plan.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { sortOrder: 'asc' },
  });
}

export default async function AdminStudentsPage() {
  let students: Awaited<ReturnType<typeof getStudents>> = [];
  let plans: Awaited<ReturnType<typeof getPlans>> = [];
  try {
    [students, plans] = await Promise.all([getStudents(), getPlans()]);
  } catch {
    // DB not ready
  }

  const verified = students.filter((s) => s.verificationStatus === 'VERIFIED').length;
  const pending = students.filter((s) => s.verificationStatus === 'PENDING').length;
  const rejected = students.filter((s) => s.verificationStatus === 'REJECTED').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">Students</h1>
          <p className="mt-1 text-sm text-white/40">{students.length} total students</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: students.length, icon: Users },
          { label: 'Verified', value: verified, icon: CheckCircle },
          { label: 'Pending', value: pending, icon: Clock },
          { label: 'Rejected', value: rejected, icon: XCircle },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/30">{stat.label}</span>
                <Icon size={14} className="text-white/15" />
              </div>
              <p className="mt-1 text-xl font-bold text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Student ID</th>
                <th>Plan</th>
                <th>Progress</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const activeSub = student.subscriptions[0];
                const activePlan = activeSub?.plan;
                const completedVideos = student.videoProgress.filter((p) => p.completed).length;
                const totalVideos = student.videoProgress.length;
                const progressPct = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

                return (
                  <tr key={student.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        {student.image ? (
                          <img src={student.image} alt="" className="h-8 w-8 rounded-full" />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-xs font-medium text-white/50">
                            {student.name?.[0]?.toUpperCase() ?? 'U'}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-white">{student.name ?? 'Unknown'}</p>
                          <p className="text-[11px] text-white/25">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-xs text-white/50">{student.studentId ?? '—'}</td>
                    <td>
                      {activePlan ? (
                        <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/50">{activePlan.name}</span>
                      ) : (
                        <span className="text-xs text-white/20">Free</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-white/5">
                          <div className="h-full rounded-full bg-white/30" style={{ width: `${progressPct}%` }} />
                        </div>
                        <span className="text-xs text-white/30">{progressPct}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        student.verificationStatus === 'VERIFIED' ? 'bg-green-500/10 text-green-400'
                          : student.verificationStatus === 'REJECTED' ? 'bg-red-500/10 text-red-400'
                          : 'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {student.verificationStatus}
                      </span>
                    </td>
                    <td>
                      <StudentActions
                        studentId={student.id}
                        currentStatus={student.verificationStatus}
                        currentPlanId={activePlan?.id ?? null}
                        plans={plans}
                      />
                    </td>
                  </tr>
                );
              })}
              {students.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Users size={32} className="mx-auto text-white/10" />
                    <p className="mt-2 text-sm text-white/20">No students yet</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
