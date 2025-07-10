import { URLStatus } from '@/shared/types/api';
import type { StatusBadgeConfig } from '../types';

export function getURLStatusConfig(status: URLStatus): StatusBadgeConfig {
  const config: Record<URLStatus, StatusBadgeConfig> = {
    [URLStatus.QUEUED]: {
      label: 'Queued',
      variant: 'secondary',
      icon: 'time',
      className: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    },
    [URLStatus.RUNNING]: {
      label: 'Running',
      variant: 'secondary',
      icon: 'loading',
      className: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      iconClassName: 'animate-spin',
    },
    [URLStatus.COMPLETED]: {
      label: 'Completed',
      variant: 'secondary',
      icon: 'completed',
      className: 'bg-green-100 text-green-700 hover:bg-green-200',
    },
    [URLStatus.ERROR]: {
      label: 'Error',
      variant: 'destructive',
      icon: 'error',
      className: 'bg-red-100 text-red-700 hover:bg-red-200',
    },
  };

  return config[status];
}
