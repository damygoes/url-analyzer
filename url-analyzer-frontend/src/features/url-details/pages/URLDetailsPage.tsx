import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';

import { Icon } from '@/components/ui/icon/Icon';
import { useCrawlStatus, useURLDetails } from '@/features/urls/hooks/useURLs';
import { ActionButtons } from '../components/ActionButtons';
import { StatsGrid } from '../components/StatsGrid';
import { URLDetailsPageSkeleton } from '../components/URLDetailsPageSkeleton';
import { URLInfoCard } from '../components/URLInfoCard';
import { BrokenLinksSection } from '../sections/BrokenLinksSection';
import { ChartsSection } from '../sections/ChartsSection';

export function URLDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useURLDetails(Number(id));

  const url = data?.url;
  const isRunning = url?.status === 'running';
  const liveJobStatus = useCrawlStatus(url?.id ?? 0, !!isRunning).data;

  if (isLoading) {
    return <URLDetailsPageSkeleton />;
  }

  if (error || !data || !url) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="gap-2"
        >
          <Icon name="left" />
          Back to Dashboard
        </Button>
        <Alert variant="destructive">
          <Icon name="alert-circle" />
          <AlertDescription>
            Failed to load URL details. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { crawl_result, job_status, broken_links } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="gap-2"
        >
          <Icon name="left" />
          Back to Dashboard
        </Button>

        <ActionButtons urlId={url.id} errorMessage={url.error_message} />
      </div>

      <URLInfoCard
        url={url.url}
        title={crawl_result?.title || null}
        status={url.status}
        jobStatus={liveJobStatus || job_status}
        isRunning={isRunning}
        errorMessage={url.error_message}
      />

      {crawl_result && (
        <>
          <StatsGrid
            htmlVersion={crawl_result.html_version}
            internalLinks={crawl_result.internal_links}
            externalLinks={crawl_result.external_links}
            brokenLinksCount={crawl_result.broken_links_count}
            hasLoginForm={crawl_result.has_login_form}
          />

          <ChartsSection crawlResult={crawl_result} />

          <BrokenLinksSection brokenLinks={broken_links} />
        </>
      )}
    </div>
  );
}
