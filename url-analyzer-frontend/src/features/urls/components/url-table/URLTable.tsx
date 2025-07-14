import { Table, TableBody } from '@/components/ui/table';
import { useURLAnalysisStore } from '@/features/url-analysis/store/urlAnalysisStore';
import { useURLStore } from '@/features/urls/store/urlStore';
import type { URLWithResult } from '@/shared/types/api';
import { SortOrder, URLSortField } from '@/shared/types/api';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PaginationControls } from './PaginationControls';
import { URLTableEmptyState } from './URLTableEmptyState';
import { URLTableHeader } from './URLTableHeader';
import { URLTableRow } from './URLTableRow';
import { URLTableSkeleton } from './URLTableSkeleton';

interface URLTableProps {
  data: URLWithResult[];
  isLoading: boolean;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function URLTable({ data, isLoading, pagination }: URLTableProps) {
  const navigate = useNavigate();
  const selectedURLs = useURLStore((s) => s.selectedURLs);
  const toggleSelection = useURLStore((s) => s.toggleSelection);
  const selectAll = useURLStore((s) => s.selectAll);
  const clearSelection = useURLStore((s) => s.clearSelection);
  const filters = useURLStore((s) => s.filters);
  const setFilters = useURLStore((s) => s.setFilters);

  const analyzingIDs = useURLAnalysisStore((s) => s.analyzingIDs);

  const handleSort = (field: URLSortField) => {
    if (filters.sort_by === field) {
      setFilters({
        sort_order:
          filters.sort_order === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC,
      });
    } else {
      setFilters({
        sort_by: field,
        sort_order: SortOrder.ASC,
      });
    }
  };

  const isAllSelected = useMemo(
    () => data.length > 0 && data.every((url) => selectedURLs.includes(url.id)),
    [data, selectedURLs]
  );

  const isSomeSelected = useMemo(
    () => data.some((url) => selectedURLs.includes(url.id)),
    [data, selectedURLs]
  );

  const handleSelectAll = () => {
    if (isAllSelected) {
      clearSelection();
    } else {
      selectAll(data.map((url) => url.id));
    }
  };

  const handleRowClick = useCallback(
    (id: number) => {
      navigate(`/urls/${id}`);
    },
    [navigate]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setFilters({ page });
    },
    [setFilters]
  );

  if (isLoading) return <URLTableSkeleton />;

  if (data.length === 0) return <URLTableEmptyState />;

  return (
    <div className="space-y-4">
      <div className="rounded-md border min-h-[550px] overflow-y-auto">
        <Table>
          <URLTableHeader
            currentSortBy={filters.sort_by}
            currentSortOrder={filters.sort_order}
            onSort={handleSort}
            isAllSelected={isAllSelected}
            isSomeSelected={isSomeSelected}
            onSelectAll={handleSelectAll}
          />
          <TableBody>
            {data.map((url) => (
              <URLTableRow
                key={url.id}
                url={url}
                isSelected={selectedURLs.includes(url.id)}
                onToggleSelect={toggleSelection}
                isDisabled={analyzingIDs.includes(url.id)}
                onRowClick={() => handleRowClick(url.id)}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <PaginationControls
        page={pagination.page}
        pageSize={pagination.pageSize}
        total={pagination.total}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
