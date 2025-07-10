import { Icon } from '@/components/ui/icon/Icon';
import { cn } from '@/lib/utils';
import { type CrawlJobStatus, CrawlStatus } from '@/shared/types/api';
import { crawlStatusConfig } from '../../utils/crawlStatusConfig';

interface CrawlStatusLabelProps {
  status: CrawlJobStatus;
}

export function CrawlStatusLabel({ status }: CrawlStatusLabelProps) {
  const config =
    crawlStatusConfig[status.status] || crawlStatusConfig[CrawlStatus.STARTED];

  return (
    <div className="flex items-center gap-3">
      <Icon
        name={config.icon}
        className={cn(
          'h-5 w-5',
          config.color,
          status.status !== CrawlStatus.COMPLETED &&
            status.status !== CrawlStatus.FAILED &&
            'animate-spin'
        )}
      />
      <div className="flex-1">
        <p className="text-sm font-medium">{config.label}</p>
        {status.message && (
          <p className="text-xs text-muted-foreground">{status.message}</p>
        )}
      </div>
      <span className="text-sm font-medium">{status.progress}%</span>
    </div>
  );
}
