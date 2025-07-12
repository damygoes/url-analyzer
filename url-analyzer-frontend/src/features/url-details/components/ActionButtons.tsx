import { Button } from '@/components/ui/button';
import {
  useCrawlStatus,
  useRestartCrawlingURLs,
  useStartCrawlingURLs,
  useStopCrawlingURLs,
} from '@/features/urls/hooks/useURLs';
import { CrawlStatus } from '@/shared/types/api';
import { toast } from 'sonner';

interface ActionButtonsProps {
  urlId: number;
  errorMessage?: string | null;
}

export function ActionButtons({ urlId, errorMessage }: ActionButtonsProps) {
  const { data: jobStatus } = useCrawlStatus(urlId, true);

  const startCrawling = useStartCrawlingURLs();
  const stopCrawling = useStopCrawlingURLs();
  const restartCrawling = useRestartCrawlingURLs();

  const isRunning =
    jobStatus?.status && !['FAILED', 'COMPLETED'].includes(jobStatus.status);
  const hasError = !!errorMessage || jobStatus?.status === CrawlStatus.FAILED;
  const showStart = !isRunning || hasError;

  const handleStart = async () => {
    try {
      await startCrawling.mutateAsync(urlId);
      toast.success('Analysis started', { position: 'top-right' });
    } catch (e) {
      console.error('Error starting analysis:', e);
      toast.error('Failed to start analysis', { position: 'top-right' });
    }
  };

  const handleStop = async () => {
    try {
      await stopCrawling.mutateAsync([urlId]);
      toast.success('Analysis stopped', { position: 'top-right' });
    } catch (e) {
      console.error('Error stopping analysis:', e);
      toast.error('Failed to stop analysis', { position: 'top-right' });
    }
  };

  const handleRestart = async () => {
    try {
      await restartCrawling.mutateAsync([urlId]);
      toast.success('Analysis restarted', { position: 'top-right' });
    } catch (e) {
      console.error('Error restarting analysis:', e);
      toast.error('Failed to restart analysis', { position: 'top-right' });
    }
  };

  return (
    <div className="flex gap-2">
      {showStart && (
        <Button
          icon="play"
          onClick={handleStart}
          disabled={startCrawling.isPending}
          className="gap-2"
        >
          Start Analysis
        </Button>
      )}
      {isRunning && !hasError && (
        <>
          <Button
            icon="stop"
            onClick={handleStop}
            disabled={stopCrawling.isPending}
            variant="destructive"
            className="gap-2"
          >
            Stop Analysis
          </Button>
          <Button
            icon="refresh"
            onClick={handleRestart}
            disabled={restartCrawling.isPending}
            className="gap-2"
          >
            Restart Analysis
          </Button>
        </>
      )}
    </div>
  );
}
