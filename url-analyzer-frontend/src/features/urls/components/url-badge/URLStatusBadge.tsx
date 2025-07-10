import { URLStatus } from '@/shared/types/api';
import { getURLStatusConfig } from '../../utils/urlStatusConfig';
import { StatusBadge } from './StatusBadge';
interface URLStatusBadgeProps {
  status: URLStatus;
  className?: string;
}

export function URLStatusBadge({ status, className }: URLStatusBadgeProps) {
  const config = getURLStatusConfig(status);

  return (
    <StatusBadge
      label={config.label}
      icon={config.icon}
      variant={config.variant}
      className={
        className ? `${config.className} ${className}` : config.className
      }
      iconClassName={config.iconClassName}
    />
  );
}
