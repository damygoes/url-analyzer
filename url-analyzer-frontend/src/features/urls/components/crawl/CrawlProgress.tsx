import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { type CrawlJobStatus } from '@/shared/types/api';
import { CrawlStatusLabel } from './CrawlStatusLabel';

interface CrawlProgressProps {
  status: CrawlJobStatus;
  className?: string;
}

export function CrawlProgress({ status, className }: CrawlProgressProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <CrawlStatusLabel status={status} />
      <Progress value={status.progress} className="h-2" />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Started: {new Date(status.start_time).toLocaleTimeString()}</span>
        {status.end_time && (
          <span>Ended: {new Date(status.end_time).toLocaleTimeString()}</span>
        )}
      </div>
    </div>
  );
}
