import type { IconName } from '@/components/ui/icon/iconMapping';

export interface StatusBadgeConfig {
  label: string;
  icon: IconName;
  variant: 'secondary' | 'destructive';
  className: string;
  iconClassName?: string;
}
