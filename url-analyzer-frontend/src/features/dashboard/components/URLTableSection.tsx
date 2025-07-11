import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Icon } from '@/components/ui/icon/Icon';
import { URLFilters } from '@/features/urls/components/URLFilters';
import { URLTable } from '@/features/urls/components/URLTable';
import type { URLWithResult } from '@/shared/types/api';

export function URLTableSection({
  data,
  isLoading,
  error,
}: {
  data:
    | {
        items: URLWithResult[];
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
      }
    | undefined;
  isLoading: boolean;
  error: Error | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>URLs</CardTitle>
        <CardDescription>View and manage all analyzed URLs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <URLFilters />

        {error && (
          <Alert variant="destructive">
            <Icon name="alert-circle" />
            <AlertDescription>
              Failed to load URLs. Please try again.
            </AlertDescription>
          </Alert>
        )}

        <URLTable
          data={data?.items || []}
          isLoading={isLoading}
          pagination={{
            page: data?.page || 1,
            pageSize: data?.pageSize || 10,
            total: data?.total || 0,
            totalPages: data?.totalPages || 1,
          }}
        />
      </CardContent>
    </Card>
  );
}
