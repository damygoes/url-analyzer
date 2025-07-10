import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon/Icon';
import { cn } from '@/lib/utils';
import type { StatusBadgeConfig } from '../../types';

export function StatusBadge({
  label,
  icon,
  variant,
  className,
  iconClassName,
}: StatusBadgeConfig) {
  return (
    <Badge variant={variant} className={cn('gap-1', className)}>
      <Icon name={icon} className={cn('h-3 w-3', iconClassName)} />
      {label}
    </Badge>
  );
}
