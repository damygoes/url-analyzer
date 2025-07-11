import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
import {
  useRestartCrawlingURLs,
  useStartCrawlingURLs,
  useStopCrawlingURLs,
  useURLDetails,
} from '@/features/urls/hooks/useURLs';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { URLDetailsPageSkeleton } from '../components/url-details/URLDetailsPageSkeleton';

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
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load URL details. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { url, crawl_result, job_status } = data;
  const isRunning = url.status === 'running';

  // Handlers
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
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="flex gap-2">
          {!isRunning && (
            <Button
              onClick={handleStart}
              disabled={startCrawling.isPending}
              className="gap-2"
            >
              <Icon name="play" />
              Start Analysis
            </Button>
          )}
          {isRunning && (
            <>
              <Button
                onClick={handleStop}
                disabled={stopCrawling.isPending}
                className="gap-2"
                variant="destructive"
              >
                <Icon name="stop" />
                Stop Analysis
              </Button>
              <Button
                onClick={handleRestart}
                disabled={restartCrawling.isPending}
                className="gap-2"
              >
                <Icon name="refresh" />
                Restart Analysis
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                {crawl_result?.title || 'Untitled Page'}
                <a
                  href={url.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Icon name="externalLink" />
                </a>
              </CardTitle>
              <CardDescription className="break-all">{url.url}</CardDescription>
            </div>
            <URLStatusBadge status={url.status} />
          </div>
        </CardHeader>
        <CardContent>
          {job_status && isRunning && <CrawlProgress status={job_status} />}

          {url.error_message && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{url.error_message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
