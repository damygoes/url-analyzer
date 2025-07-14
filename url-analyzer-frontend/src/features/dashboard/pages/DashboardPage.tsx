import { useCallback, useMemo, useState } from 'react';

import { AddURLDialog } from '@/features/urls/components/AddURLDialog';
import { useDeleteURLs, useURLs } from '@/features/urls/hooks/useURLs';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { pluralize } from '@/shared/utils/pluralize';
import { toast } from 'sonner';

import { useURLAnalysisStore } from '@/features/url-analysis/store/urlAnalysisStore';
import { useURLStore } from '@/features/urls/store/urlStore';
import { BulkActionsCard } from '../components/BulkActionsCard';
import { DashboardHeader } from '../components/DashboardHeader';
import { URLTableSection } from '../components/URLTableSection';

export function DashboardPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const { analyzingIDs } = useURLAnalysisStore();

  const selectedURLs = useURLStore((s) => s.selectedURLs);
  const filters = useURLStore((s) => s.filters);
  const clearSelection = useURLStore((s) => s.clearSelection);

  const { data, isLoading, error } = useURLs(filters);

  const deleteURLs = useDeleteURLs();

  const hasSelectedOrAnalyzing =
    selectedURLs.length > 0 || analyzingIDs.length > 0;

  const selectedCount = selectedURLs.length;

  const title = useMemo(
    () => `Delete ${selectedCount} ${pluralize(selectedCount, 'URL')}?`,
    [selectedCount]
  );

  const description = useMemo(
    () =>
      `This action cannot be undone. Are you sure you want to permanently delete ${
        selectedCount === 1 ? 'this' : 'these'
      } ${pluralize(selectedCount, 'URL')}?`,
    [selectedCount]
  );

  const handleConfirmDelete = useCallback(async () => {
    try {
      await deleteURLs.mutateAsync(selectedURLs);
      clearSelection();
      setIsConfirmDialogOpen(false);

      toast.success(
        `${selectedCount} ${pluralize(selectedCount, 'URL')} deleted successfully.`,
        { position: 'top-right' }
      );
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete URLs. Please try again.', {
        position: 'top-right',
      });
    }
  }, [deleteURLs, selectedURLs, clearSelection, selectedCount]);

  return (
    <div className="space-y-6">
      <DashboardHeader onAddClick={() => setIsAddDialogOpen(true)} />

      {hasSelectedOrAnalyzing && (
        <BulkActionsCard
          selectedIDs={selectedURLs}
          onDeleteClick={() => setIsConfirmDialogOpen(true)}
        />
      )}

      <URLTableSection data={data} isLoading={isLoading} error={error} />

      <AddURLDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />

      <ConfirmDialog
        open={isConfirmDialogOpen}
        title={title}
        description={description}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmDialogOpen(false)}
      />
    </div>
  );
}
