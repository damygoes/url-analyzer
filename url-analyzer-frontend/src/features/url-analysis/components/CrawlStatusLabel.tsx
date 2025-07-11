import { Icon } from '@/components/ui/icon/Icon';
import { cn } from '@/lib/utils';
import { type CrawlJobStatus, CrawlStatus } from '@/shared/types/api';
import { crawlStatusConfig } from '../utils/crawlStatusConfig';

interface CrawlStatusLabelProps {
  status: CrawlJobStatus;
}

export function CrawlStatusLabel({ status }: CrawlStatusLabelProps) {
  const config =
    crawlStatusConfig[status.status] || crawlStatusConfig[CrawlStatus.STARTED];

  const normalize = (text: string) =>
    text.trim().toLowerCase().replace(/\.*$/, '');

  const labelNormalized = normalize(config.label);
  const messageNormalized = status.message ? normalize(status.message) : '';

  // Only show message if it differs meaningfully from the label
  const showMessage =
    messageNormalized && messageNormalized !== labelNormalized;

  return (
    <div className="flex items-center gap-3">
      <Icon
        name={config.icon}
        size="sm"
        className={cn(
          config.color,
          status.status !== CrawlStatus.COMPLETED &&
            status.status !== CrawlStatus.FAILED &&
            'animate-spin'
        )}
      />
      <div className="flex-1">
        <p className="text-sm font-medium">{config.label}</p>
        {showMessage && (
          <p className="text-xs text-muted-foreground truncate max-w-[300px]">
            {status.message}
          </p>
        )}
      </div>
      <span className="text-sm font-medium">{status.progress}%</span>
    </div>
  );
}
