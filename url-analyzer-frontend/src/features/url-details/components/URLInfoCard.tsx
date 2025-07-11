import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Icon } from '@/components/ui/icon/Icon';
import { CrawlProgress } from '@/features/url-analysis/components/CrawlProgress';
import { URLStatusBadge } from '@/features/urls/components/url-badge/URLStatusBadge';
import type { CrawlJobStatus, URLStatus } from '@/shared/types/api';
import { AlertCircle } from 'lucide-react';

interface URLInfoCardProps {
  url: string;
  title: string | null;
  status: URLStatus;
  jobStatus?: CrawlJobStatus;
  isRunning: boolean;
  errorMessage?: string | null;
}

export function URLInfoCard({
  url,
  title,
  status,
  jobStatus,
  isRunning,
  errorMessage,
}: URLInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              {title || 'Untitled Page'}
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <Icon name="externalLink" />
              </a>
            </CardTitle>
            <CardDescription className="break-all">{url}</CardDescription>
          </div>
          <URLStatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent>
        {jobStatus && isRunning && <CrawlProgress status={jobStatus} />}
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
