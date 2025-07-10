import type { IconName } from '@/components/ui/icon/iconMapping';

export type StatusBadgeConfig = {
  label: string;
  icon: IconName;
  variant: 'secondary' | 'destructive';
  className: string;
  iconClassName?: string;
};

export type CrawlStatusConfigEntry = {
  label: string;
  icon: IconName;
  color: string;
};
