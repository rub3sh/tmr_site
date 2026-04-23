'use client';

import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import {
  User, CreditCard, BookOpen, Trophy, Clock, LogOut, Shield, ExternalLink,
} from 'lucide-react';

interface ProfileData {
  user: {
    id: string;
    name: string | null;
    email: string;
    studentId: string | null;
    verificationStatus: string;
    image: string | null;
    discordUsername: string | null;
    createdAt: string;
  };
  subscription: {
    planName: string;
    status: string;
    billingCycle: string;
    currentPeriodEnd: string;
  } | null;
  stats: {
    coursesAccessed: number;
    videosCompleted: number;
    totalWatchHours: number;
    leaderboardRank: number | null;
  };
  discordInvite: string | null;
}

export default function StudentProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    fetch('/api/student/profile')
      .then((r) => r.json())
      .then((d) => { if (d.data) setProfile(d.data); })
      .catch(() => {});
  }, []);

  if (!session) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-white">Profile</h1>
        <p className="mt-1 text-sm text-white/40">Your account and progress</p>
      </div>

      {/* User Card */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <div className="flex items-center gap-5">
          {session.user.image ? (
            <img src={session.user.image} alt="" className="h-20 w-20 rounded-full border-2 border-white/10" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/10 bg-white/5 text-2xl font-bold text-white/30">
              {session.user.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-white">{session.user.name ?? 'Unknown'}</h2>
            <p className="text-sm text-white/30">{session.user.email}</p>
            <div className="mt-2 flex items-center gap-3">
              {profile?.user.studentId && (
                <span className="rounded-full bg-white/5 px-3 py-1 font-mono text-xs text-white/40">
                  {profile.user.studentId}
                </span>
              )}
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                profile?.user.verificationStatus === 'VERIFIED' ? 'bg-green-500/10 text-green-400'
                  : profile?.user.verificationStatus === 'REJECTED' ? 'bg-red-500/10 text-red-400'
                  : 'bg-yellow-500/10 text-yellow-400'
              }`}>
                {profile?.user.verificationStatus ?? 'PENDING'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Courses', value: profile?.stats.coursesAccessed ?? 0, icon: BookOpen },
          { label: 'Videos Done', value: profile?.stats.videosCompleted ?? 0, icon: Clock },
          { label: 'Watch Time', value: `${profile?.stats.totalWatchHours ?? 0}h`, icon: Clock },
          { label: 'Rank', value: profile?.stats.leaderboardRank ? `#${profile.stats.leaderboardRank}` : '—', icon: Trophy },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <Icon size={16} className="text-white/15" />
              <p className="mt-2 text-xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-white/25">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Subscription */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={18} className="text-white/30" />
          <h3 className="text-lg font-semibold text-white">Subscription</h3>
        </div>
        {profile?.subscription ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs text-white/25">Plan</p>
              <p className="text-sm font-medium text-white">{profile.subscription.planName}</p>
            </div>
            <div>
              <p className="text-xs text-white/25">Status</p>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                profile.subscription.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {profile.subscription.status}
              </span>
            </div>
            <div>
              <p className="text-xs text-white/25">Billing</p>
              <p className="text-sm text-white/50">{profile.subscription.billingCycle}</p>
            </div>
            <div>
              <p className="text-xs text-white/25">Renews</p>
              <p className="text-sm text-white/50">{new Date(profile.subscription.currentPeriodEnd).toLocaleDateString()}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-white/20">No active subscription</p>
        )}
      </div>

      {/* Discord Access */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={18} className="text-white/30" />
          <h3 className="text-lg font-semibold text-white">Discord Community</h3>
        </div>
        {profile?.discordInvite ? (
          <a
            href={profile.discordInvite}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-[#5865F2]/10 px-5 py-3 text-sm font-semibold text-[#5865F2] transition hover:bg-[#5865F2]/20"
          >
            Join Private Server <ExternalLink size={14} />
          </a>
        ) : profile?.user.discordUsername ? (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5865F2]/10">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#5865F2">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-white/50">Connected as</p>
              <p className="text-sm font-medium text-white">{profile.user.discordUsername}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-white/20">Subscribe to a plan to get Discord access</p>
        )}
      </div>

      {/* Sign Out */}
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm text-white/30 transition hover:bg-white/5 hover:text-red-400"
      >
        <LogOut size={16} /> Sign Out
      </button>
    </div>
  );
}
