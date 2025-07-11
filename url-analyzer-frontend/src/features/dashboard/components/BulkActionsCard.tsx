import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon/Icon';
import { pluralize } from '@/shared/utils/pluralize';

type BulkActionsCardProps = {
  selectedCount: number;
  onDelete: () => void;
  onRerun: () => void;
  isRerunPending?: boolean;
  rerunError?: Error | null;
};

export function BulkActionsCard({
  selectedCount,
  onRerun,
  onDelete,
  isRerunPending,
  rerunError,
}: BulkActionsCardProps) {
  return (
    <Card className="py-0">
      <CardContent className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {selectedCount} {pluralize(selectedCount, 'URL')} selected
          </span>
          <div className="flex gap-2">
            <Button
              icon="refresh"
              variant="outline"
              size="sm"
              onClick={onRerun}
              disabled={isRerunPending}
              isLoading={isRerunPending}
              className="gap-2"
            >
              {isRerunPending ? 'Re-running...' : 'Re-run Analysis'}
            </Button>
            <Button
              icon="delete"
              variant="destructive"
              size="sm"
              onClick={onDelete}
              className="gap-2"
            >
              Delete
            </Button>
          </div>
        </div>

        {rerunError && (
          <Alert variant="destructive">
            <Icon name="alert-circle" />
            <AlertDescription>
              Failed to re-run analysis. Please try again.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
