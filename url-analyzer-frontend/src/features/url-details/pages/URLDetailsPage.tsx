import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Icon } from '@/components/ui/icon/Icon';
import {
  useRestartCrawlingURLs,
  useStartCrawlingURLs,
  useStopCrawlingURLs,
  useURLDetails,
} from '@/features/urls/hooks/useURLs';
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

  const startCrawling = useStartCrawlingURLs();
  const restartCrawling = useRestartCrawlingURLs();
  const stopCrawling = useStopCrawlingURLs();

  if (isLoading) {
    return <URLDetailsPageSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="gap-2"
        >
          <Icon name='left' />
          Back to Dashboard
        </Button>
        <Alert variant="destructive">
          <Icon name='alert-circle' />
          <AlertDescription>
            Failed to load URL details. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { url, crawl_result, job_status, broken_links } = data;
  const isRunning = url.status === 'running';

  const handleStart = async () => {
    try {
      await startCrawling.mutateAsync(url.id);
      toast.success('Analysis started');
    } catch (e) {
      console.error('Error starting analysis:', e);
      toast.error('Failed to start analysis');
    }
  };

  const handleRestart = async () => {
    try {
      await restartCrawling.mutateAsync([url.id]);
      toast.success('Analysis restarted');
    } catch (e) {
      console.error('Error restarting analysis:', e);
      toast.error('Failed to restart analysis');
    }
  };

  const handleStop = async () => {
    try {
      await stopCrawling.mutateAsync([url.id]);
      toast.success('Analysis stopped');
    } catch (e) {
      console.error('Error stopping analysis:', e);
      toast.error('Failed to stop analysis');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="gap-2"
        >
          <Icon name='left' />
          Back to Dashboard
        </Button>

        <ActionButtons
          isRunning={isRunning}
          onStart={handleStart}
          onStop={handleStop}
          onRestart={handleRestart}
          isStartLoading={startCrawling.isPending}
          isStopLoading={stopCrawling.isPending}
          isRestartLoading={restartCrawling.isPending}
        />
      </div>

      <URLInfoCard
        url={url.url}
        title={crawl_result?.title || null}
        status={url.status}
        jobStatus={job_status}
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

          <ChartsSection />

          <BrokenLinksSection brokenLinks={broken_links} />
        </>
      )}
    </div>
  );
}
