import { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon/Icon';
import { pluralize } from '@/shared/utils/pluralize';

import { useStartCrawlingURLs } from '@/features/urls/hooks/useURLs';
import { useURLStore } from '@/features/urls/store/urlStore';
import type { URLItem } from '@/features/urls/types';
import { toast } from 'sonner';

type BulkActionsCardProps = {
  selectedIDs: number[];
  urlItems: URLItem[];
  onDeleteClick: () => void;
};

export function BulkActionsCard({
  selectedIDs,
  urlItems,
  onDeleteClick,
}: BulkActionsCardProps) {
  const startCrawling = useStartCrawlingURLs();
  const { clearSelection } = useURLStore();

  const selectedURLs = urlItems.filter((url) => selectedIDs.includes(url.id));
  const isAnyRunning = selectedURLs.some(url => url.status === 'running');

  const [error, setError] = useState<Error | null>(null);

  const isLoading = startCrawling.isPending;

  const handleStart = async () => {
    try {
      setError(null);
      await Promise.all(selectedIDs.map((id) => startCrawling.mutateAsync(id)));
      clearSelection();
      toast.success(`${selectedIDs.length} URLs started for analysis`, {
        position: 'top-right',
      });
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
            <Button onClick={handleStart} disabled={isLoading}>
              Start Analysis
            </Button>
            <Button
              onClick={onDeleteClick}
              variant="destructive"
              disabled={isLoading || isAnyRunning}
              title={isAnyRunning ? 'Cannot delete while analysis is running' : undefined}
            >
              Delete
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <Icon name="alert-circle" />
            <AlertDescription>{error.message || 'An error occurred'}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
