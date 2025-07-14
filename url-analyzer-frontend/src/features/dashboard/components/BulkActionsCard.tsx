import { useCallback, useMemo, useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon/Icon';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { pluralize } from '@/shared/utils/pluralize';

import {
  useRestartCrawlingURLs,
  useStartCrawlingURLs,
  useStopCrawlingURLs,
} from '@/features/urls/hooks/useURLs';

import { useURLAnalysisStore } from '@/features/url-analysis/store/urlAnalysisStore';
import { getErrorMessage } from '@/shared/utils/getErrorMessage';
import { toast } from 'sonner';

type BulkActionsCardProps = {
  selectedIDs: number[];
  onDeleteClick: () => void;
};

export function BulkActionsCard({
  selectedIDs,
  onDeleteClick,
}: BulkActionsCardProps) {
  const startCrawling = useStartCrawlingURLs();
  const restartCrawling = useRestartCrawlingURLs();
  const stopCrawling = useStopCrawlingURLs();

  const analyzingIDs = useURLAnalysisStore((s) => s.analyzingIDs);
  const addAnalyzingIDs = useURLAnalysisStore((s) => s.addAnalyzingIDs);
  const removeAnalyzingIDs = useURLAnalysisStore((s) => s.removeAnalyzingIDs);

  const [error, setError] = useState<Error | null>(null);

  const isLoading = useMemo(
    () =>
      startCrawling.isPending ||
      restartCrawling.isPending ||
      stopCrawling.isPending,
    [startCrawling.isPending, restartCrawling.isPending, stopCrawling.isPending]
  );

  const areAllAnalyzing = useMemo(
    () =>
      selectedIDs.length > 0 &&
      selectedIDs.every((id) => analyzingIDs.includes(id)),
    [selectedIDs, analyzingIDs]
  );

  const isAnyAnalyzing = useMemo(
    () => selectedIDs.some((id) => analyzingIDs.includes(id)),
    [selectedIDs, analyzingIDs]
  );

  const handleStart = useCallback(async () => {
    try {
      setError(null);
      await Promise.all(selectedIDs.map((id) => startCrawling.mutateAsync(id)));
      addAnalyzingIDs(selectedIDs);
      toast.success(`${selectedIDs.length} URLs started for analysis`, {
        position: 'top-right',
      });
    } catch (e) {
      setError(new Error(getErrorMessage(e)));
    }
  }, [selectedIDs, startCrawling, addAnalyzingIDs]);

  const handleRestart = useCallback(async () => {
    try {
      setError(null);
      await restartCrawling.mutateAsync(selectedIDs);
      addAnalyzingIDs(selectedIDs);
      toast.success(`${selectedIDs.length} URLs restarted for analysis`, {
        position: 'top-right',
      });
    } catch (e) {
      setError(new Error(getErrorMessage(e)));
    }
  }, [selectedIDs, restartCrawling, addAnalyzingIDs]);

  const handleStop = useCallback(async () => {
    try {
      setError(null);
      await stopCrawling.mutateAsync(selectedIDs);
      removeAnalyzingIDs(selectedIDs);
      toast.success(`${selectedIDs.length} URLs stopped from analysis`, {
        position: 'top-right',
      });
    } catch (e) {
      setError(new Error(getErrorMessage(e)));
    }
  }, [selectedIDs, stopCrawling, removeAnalyzingIDs]);

  return (
    <Card className="py-0">
      <CardContent className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {selectedIDs.length} {pluralize(selectedIDs.length, 'URL')} selected
          </span>

          <div className="flex gap-2">
            {areAllAnalyzing ? (
              <Button
                onClick={handleStop}
                disabled={isLoading}
                variant="destructive"
              >
                Stop Analysis
              </Button>
            ) : isAnyAnalyzing ? (
              <>
                <Button onClick={handleRestart} disabled={isLoading}>
                  Restart Analysis
                </Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="destructive" disabled>
                      Delete
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    You cannot delete URLs while analysis is running.
                  </TooltipContent>
                </Tooltip>
              </>
            ) : (
              <>
                <Button onClick={handleStart} disabled={isLoading}>
                  Start Analysis
                </Button>
                <Button
                  onClick={onDeleteClick}
                  variant="destructive"
                  disabled={isLoading}
                >
                  Delete
                </Button>
              </>
            )}
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
