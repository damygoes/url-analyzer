import { useState } from 'react';

import { AddURLDialog } from '@/features/urls/components/AddURLDialog';
import {
  useDeleteURLs,
  useRerunURLs,
  useURLs,
} from '@/features/urls/hooks/useURLs';
import { useURLStore } from '@/features/urls/store/urlStore';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { pluralize } from '@/shared/utils/pluralize';
import { toast } from 'sonner';
import { BulkActionsCard } from '../components/BulkActionsCard';
import { DashboardHeader } from '../components/DashboardHeader';
import { URLTableSection } from '../components/URLTableSection';

export function DashboardPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const { filters, selectedURLs, clearSelection } = useURLStore();
  const { data, isLoading, error } = useURLs(filters);
  const deleteURLs = useDeleteURLs();
  const rerunURLs = useRerunURLs();

  const selectedCount = selectedURLs.length;

  const title = `Delete ${selectedCount} ${pluralize(selectedCount, 'URL')}?`;
  const description = `This action cannot be undone. Are you sure you want to permanently delete ${
    selectedCount === 1 ? 'this' : 'these'
  } ${pluralize(selectedCount, 'URL')}?`;

  const handleBulkRerun = async () => {
    if (selectedCount === 0 || rerunURLs.isPending) return;

    try {
      await rerunURLs.mutateAsync(selectedURLs);
      clearSelection();

      toast.success(
        `${selectedCount} ${pluralize(selectedCount, 'URL')} re-queued for analysis`,
        {
          position: 'top-right',
        }
      );
    } catch (err) {
      console.error(err);
      toast.error('Failed to re-run analysis. Please try again.', {
        position: 'top-right',
      });
    }
  };

  const handleConfirmDelete = async () => {
    await deleteURLs.mutateAsync(selectedURLs);
    clearSelection();
    setIsConfirmDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <DashboardHeader onAddClick={() => setIsAddDialogOpen(true)} />

      {selectedCount > 0 && (
        <BulkActionsCard
          selectedCount={selectedCount}
          onDelete={() => setIsConfirmDialogOpen(true)}
          onRerun={handleBulkRerun}
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
