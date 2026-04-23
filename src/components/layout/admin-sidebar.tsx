'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  BookOpen,
  CreditCard,
  Users,
  Trophy,
  Calendar,
  BarChart3,
  Gift,
  Ticket,
  TrendingUp,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { useState } from 'react';

const ICON_MAP = {
  LayoutDashboard,
  BookOpen,
  CreditCard,
  Users,
  Trophy,
  Calendar,
  BarChart3,
  Gift,
  Ticket,
  TrendingUp,
  Settings,
  FileText,
} as const;

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' as const },
  { label: 'Courses', href: '/admin/courses', icon: 'BookOpen' as const },
  { label: 'Blog', href: '/admin/blog', icon: 'FileText' as const },
  { label: 'Plans', href: '/admin/plans', icon: 'CreditCard' as const },
  { label: 'Students', href: '/admin/students', icon: 'Users' as const },
  { label: 'Leaderboard', href: '/admin/leaderboard', icon: 'Trophy' as const },
  { label: 'Calendar', href: '/admin/calendar', icon: 'Calendar' as const },
  { label: 'Indicators', href: '/admin/indicators', icon: 'BarChart3' as const },
  { label: 'Giveaways', href: '/admin/giveaways', icon: 'Gift' as const },
  { label: 'Coupons', href: '/admin/coupons', icon: 'Ticket' as const },
  { label: 'Analytics', href: '/admin/analytics', icon: 'TrendingUp' as const },
  { label: 'Settings', href: '/admin/settings', icon: 'Settings' as const },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-white/5 bg-[#050505] transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-white/5 px-4">
        <Link href="/admin" className="flex items-center gap-3">
          <Image
            src="/logo/logo-new-tab.png"
            alt="Admin"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
          {!collapsed && (
            <span className="text-sm font-semibold tracking-wide text-white">
              Admin Panel
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1 text-white/30 transition-colors hover:bg-white/5 hover:text-white/60"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.icon];
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-white/8 text-white'
                  : 'text-white/40 hover:bg-white/[0.04] hover:text-white/70'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-white/5 p-3">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/30 transition-all duration-200 hover:bg-white/[0.04] hover:text-red-400"
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
