export const COLORS = {
  black: '#000000',
  white: '#FFFFFF',
  accent: '#FFFFFF',
  accentMuted: '#888888',
  accentDark: '#CCCCCC',
  surface: '#0a0a0a',
  card: '#111111',
  elevated: '#181818',
} as const;

export const HERO_QUOTES = [
  'Time is not passing. It is unfolding in structure.',
  'Price does not move randomly. It obeys unseen symmetry.',
  'Every movement is a reflection of hidden order.',
  'Markets are not chaos — they are compressed mathematics.',
  'Those who see time, control price.',
  'The edge is not in indicators. It is in understanding cycles.',
] as const;

export const WHY_WE_ARE_HERE = [
  'To decode the structure behind price.',
  'To reveal what most traders never see.',
  'To turn randomness into precision.',
] as const;

export const WHY_YOU_ARE_HERE = [
  "You've seen inconsistency.",
  "You've felt the market is controlled.",
  "You know there's something deeper.",
] as const;

export const APP_NAME = "Mellow's Hive";
export const CURRENCY = 'INR';
export const PROGRESS_UPDATE_INTERVAL_MS = 30_000;

export const PLAN_TIERS = {
  STARTER: 'starter',
  PRO: 'pro',
  ELITE: 'elite',
} as const;

export const NAV_ITEMS_STUDENT = [
  { label: 'Library', href: '/student/library' },
  { label: 'Calendar', href: '/student/calendar' },
  { label: 'Leaderboards', href: '/student/leaderboards' },
  { label: 'Indicators', href: '/student/indicators' },
  { label: 'Tutor', href: '/student/tutor' },
  { label: 'Giveaways', href: '/student/giveaways' },
] as const;

export const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
  { label: 'Courses', href: '/admin/courses', icon: 'BookOpen' },
  { label: 'Plans', href: '/admin/plans', icon: 'CreditCard' },
  { label: 'Students', href: '/admin/students', icon: 'Users' },
  { label: 'Leaderboard', href: '/admin/leaderboard', icon: 'Trophy' },
  { label: 'Calendar', href: '/admin/calendar', icon: 'Calendar' },
  { label: 'Indicators', href: '/admin/indicators', icon: 'BarChart3' },
  { label: 'Giveaways', href: '/admin/giveaways', icon: 'Gift' },
  { label: 'Coupons', href: '/admin/coupons', icon: 'Ticket' },
  { label: 'Analytics', href: '/admin/analytics', icon: 'TrendingUp' },
  { label: 'Settings', href: '/admin/settings', icon: 'Settings' },
] as const;
