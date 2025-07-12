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
import { mapCrawlToURLStatus } from '@/features/url-analysis/utils/mapCrawlToURLStatus';
import { URLStatusBadge } from '@/features/urls/components/url-badge/URLStatusBadge';
import type { CrawlJobStatus, URLStatus } from '@/shared/types/api';
import { Link } from 'react-router-dom';

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
              <Link
                to={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <Icon name="externalLink" />
              </Link>
            </CardTitle>
            <CardDescription className="break-all">{url}</CardDescription>
          </div>
          <URLStatusBadge
            status={
              jobStatus && isRunning
                ? mapCrawlToURLStatus(jobStatus.status)
                : status
            }
          />
        </div>
      </CardHeader>
      <CardContent>
        {isRunning && (
          <>
            {jobStatus ? (
              <CrawlProgress status={jobStatus} />
            ) : (
              <div className="flex items-center text-sm text-muted-foreground gap-2">
                <Icon name="loading" className="animate-spin h-4 w-4" />
                Preparing analysis...
              </div>
            )}
          </>
        )}
        {errorMessage && (
          <Alert variant="destructive">
            <Icon name="alert-circle" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
