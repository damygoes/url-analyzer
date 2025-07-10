import * as Icons from 'lucide-react';

export const iconMap = {
  account: Icons.BadgeCheck,
  activity: Icons.Activity,
  alert: Icons.AlertTriangle,
  'alert-circle': Icons.AlertCircle,
  'arrow-right': Icons.ArrowRight,
  calendar: Icons.Calendar,
  'check-circle': Icons.CheckCircle,
  close: Icons.X,
  dashboard: Icons.LayoutDashboard,
  info: Icons.Info,
  invisible: Icons.EyeOff,
  key: Icons.Key,
  left: Icons.ChevronLeft,
  link: Icons.Link,
  loading: Icons.Loader2,
  lock: Icons.Lock,
  logout: Icons.LogOut,
  menu: Icons.Menu,
  notifications: Icons.Bell,
  profile: Icons.User,
  right: Icons.ChevronRight,
  search: Icons.Search,
  settings: Icons.Settings,
  visible: Icons.Eye,
} as const;

export type IconName = keyof typeof iconMap;

// This gives a typed array of keys
export const iconNames = Object.keys(iconMap) as IconName[];
