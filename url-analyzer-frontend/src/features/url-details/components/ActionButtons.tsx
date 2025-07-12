import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  urlKeys,
  useCrawlStatus,
  useRestartCrawlingURLs,
  useStartCrawlingURLs,
  useStopCrawlingURLs,
} from '@/features/urls/hooks/useURLs';
import { CrawlStatus, URLStatus } from '@/shared/types/api';

interface ActionButtonsProps {
  urlId: number;
  status: URLStatus;
}

export function ActionButtons({ urlId, status }: ActionButtonsProps) {
  const queryClient = useQueryClient();

  const [isRunning, setIsRunning] = useState(status === URLStatus.RUNNING);
  const [shouldPoll, setShouldPoll] = useState(status === URLStatus.RUNNING);

  const { data: jobStatus } = useCrawlStatus(urlId, shouldPoll);
  const startCrawling = useStartCrawlingURLs();
  const stopCrawling = useStopCrawlingURLs();
  const restartCrawling = useRestartCrawlingURLs();

  const handleStart = async () => {
    try {
      await startCrawling.mutateAsync(urlId);
      setIsRunning(true);
      setShouldPoll(true);
      toast.success('Analysis started', { position: 'top-right' });
    } catch (e) {
      console.error('Error starting analysis:', e);
      toast.error('Failed to start analysis', { position: 'top-right' });
    }
  };

  const handleRestart = async () => {
    try {
      await restartCrawling.mutateAsync([urlId]);
      setIsRunning(true);
      setShouldPoll(true);
      toast.success('Analysis restarted', { position: 'top-right' });
    } catch (e) {
      console.error('Error restarting analysis:', e);
      toast.error('Failed to restart analysis', { position: 'top-right' });
    }
  };

  const handleStop = async () => {
    try {
      await stopCrawling.mutateAsync([urlId]);
      setIsRunning(false);
      setShouldPoll(false);
      toast.success('Analysis stopped', { position: 'top-right' });
    } catch (e) {
      console.error('Error stopping analysis:', e);
      toast.error('Failed to stop analysis', { position: 'top-right' });
    }
  };

  useEffect(() => {
    const isJobRunning =
      jobStatus?.status &&
      [
        CrawlStatus.STARTED,
        CrawlStatus.FETCHING,
        CrawlStatus.PARSING,
        CrawlStatus.ANALYZING,
        CrawlStatus.CHECKING_LINKS,
      ].includes(jobStatus.status);

    setIsRunning(Boolean(isJobRunning));

    if (
      jobStatus?.status === CrawlStatus.COMPLETED ||
      jobStatus?.status === CrawlStatus.FAILED
    ) {
      queryClient.invalidateQueries({ queryKey: urlKeys.detail(urlId) });
      queryClient.invalidateQueries({ queryKey: urlKeys.lists() });
      setShouldPoll(false);
    }
  }, [jobStatus?.status, queryClient, urlId]);

  return (
    <div className="space-y-4">
      {isRunning ? (
        <Button
          icon="stop"
          onClick={handleStop}
          disabled={stopCrawling.isPending}
          variant="destructive"
          className="gap-2"
        >
          Stop Analysis
        </Button>
      ) : status === URLStatus.QUEUED ? (
        <Button
          icon="play"
          onClick={handleStart}
          disabled={startCrawling.isPending}
          className="gap-2"
        >
          Start Analysis
        </Button>
      ) : (
        <Button
          icon="refresh"
          onClick={handleRestart}
          disabled={restartCrawling.isPending}
          className="gap-2"
        >
          Re-run Analysis
        </Button>
      )}
    </div>
  );
}
