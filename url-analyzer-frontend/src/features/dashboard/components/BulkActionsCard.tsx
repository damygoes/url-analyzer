import { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon/Icon';
import { pluralize } from '@/shared/utils/pluralize';

import { useRestartCrawlingURLs, useStartCrawlingURLs, useStopCrawlingURLs } from '@/features/urls/hooks/useURLs';
import { useURLStore } from '@/features/urls/store/urlStore';
import type { URLItem } from '@/features/urls/types';
import { toast } from 'sonner';

type BulkActionsCardProps = {
  selectedIDs: number[];
  urlItems: URLItem[];
  onDeleteClick: () => void;
};

export function BulkActionsCard({ selectedIDs, urlItems, onDeleteClick }: BulkActionsCardProps) {
  const startCrawling = useStartCrawlingURLs();
  const restartCrawling = useRestartCrawlingURLs();
  const stopCrawling = useStopCrawlingURLs();

  const { clearSelection } = useURLStore();

  const selectedURLs = urlItems.filter((url) => selectedIDs.includes(url.id));
  const statusSet = new Set(selectedURLs.map((url) => url.status));
  const allAnalyzing = statusSet.size === 1 && statusSet.has('analyzing');

  const [error, setError] = useState<Error | null>(null);

  const isLoading = startCrawling.isPending || restartCrawling.isPending || stopCrawling.isPending;

  const handleStart = async () => {
    try {
      setError(null);
      await Promise.all(selectedIDs.map(id => startCrawling.mutateAsync(id)));
      clearSelection();
      toast.success(`${selectedIDs.length} URLs started for analysis`, {position: 'top-right'});
    } catch (e) {
      setError(e as Error);
    }
  };

  const handleRestart = async () => {
    try {
      setError(null);
      await restartCrawling.mutateAsync(selectedIDs);
      clearSelection();
      toast.success(`${selectedIDs.length} URLs restarted for analysis`, {position: 'top-right'});
    } catch (e) {
      setError(e as Error);
    }
  };

  const handleStop = async () => {
    try {
      setError(null);
      await stopCrawling.mutateAsync(selectedIDs);
      toast.success(`${selectedIDs.length} URLs stopped from analysis`, {position: 'top-right'});
      clearSelection();
    } catch (e) {
      setError(e as Error);
    }
  };

  return (
    <Card className="py-0">
      <CardContent className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {selectedIDs.length} {pluralize(selectedIDs.length, 'URL')} selected
          </span>
          <div className="flex gap-2">
            {allAnalyzing ? (
              <>
                <Button onClick={handleStop} disabled={isLoading}>
                  Stop Analysis
                </Button>
                <Button onClick={handleRestart} disabled={isLoading}>
                  Restart Analysis
                </Button>
              </>
            ) : (
              <Button onClick={handleStart} disabled={isLoading}>
                Start Analysis
              </Button>
            )}
            <Button onClick={onDeleteClick} variant="destructive" disabled={isLoading}>
              Delete
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <Icon name="alert-circle" />
            <AlertDescription>
              {error.message || 'An error occurred'}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
