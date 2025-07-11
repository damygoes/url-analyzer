import * as Icons from 'lucide-react';

export const iconMap = {
  account: Icons.BadgeCheck,
  activity: Icons.Activity,
  alert: Icons.AlertTriangle,
  'alert-circle': Icons.AlertCircle,
  'arrow-down': Icons.ArrowDown,
  'arrow-right': Icons.ArrowRight,
  'arrow-up': Icons.ArrowUp,
  'arrow-up-down': Icons.ArrowUpDown,
  'bar-chart': Icons.BarChart3,
  calendar: Icons.Calendar,
  'check-circle': Icons.CheckCircle,
  close: Icons.X,
  completed: Icons.CheckCircle2,
  dashboard: Icons.LayoutDashboard,
  delete: Icons.Trash2,
  error: Icons.XCircle,
  externalLink: Icons.ExternalLink,
  'file-search': Icons.FileSearch,
  globe: Icons.Globe,
  health: Icons.HeartPulse,
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
  plus: Icons.Plus,
  profile: Icons.User,
  refresh: Icons.RefreshCw,
  right: Icons.ChevronRight,
  search: Icons.Search,
  settings: Icons.Settings,
  time: Icons.Clock,
  visible: Icons.Eye,
} as const;

export type IconName = keyof typeof iconMap;

// This gives a typed array of keys
export const iconNames = Object.keys(iconMap) as IconName[];
