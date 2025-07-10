import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AddURLDialog } from '@/features/urls/components/AddURLDialog';
import { URLTable } from '@/features/urls/components/URLTable';
import { useURLStore } from '@/features/urls/store/urlStore';
import { mockURLs } from '@/mocks/urls';
import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';

export function DashboardPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { selectedURLs, clearSelection } = useURLStore();

  const handleBulkDelete = async () => {
    if (selectedURLs.length === 0) return;
    // Trigger deletion for selected URLs
  };

  const handleBulkRerun = async () => {
    if (selectedURLs.length === 0) return;
    // Trigger rerun for selected URLs
    clearSelection();
  };

  /**
   *  Just for dummy test - !DELETE THIS LATER
   */
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Calculate the slice of data for current page
  const pagedData = mockURLs.slice((page - 1) * pageSize, page * pageSize);

  // !#################

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">URL Dashboard</h1>
          <p className="text-muted-foreground">
            Analyze and monitor website information
          </p>
        </div>

        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add URL
        </Button>
      </div>

      {selectedURLs.length > 0 && (
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <span className="text-sm text-muted-foreground">
              {selectedURLs.length} URL(s) selected
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkRerun}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Re-run Analysis
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>URLs</CardTitle>
          <CardDescription>View and manage all analyzed URLs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}

          {/* URL Table (with dummy data for now) */}
          <URLTable
            data={pagedData}
            isLoading={false}
            pagination={{
              page,
              pageSize,
              total: mockURLs.length,
              totalPages: Math.ceil(mockURLs.length / pageSize),
            }}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
      <AddURLDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </div>
  );
}
