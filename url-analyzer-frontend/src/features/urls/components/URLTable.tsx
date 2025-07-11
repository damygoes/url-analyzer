import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useURLStore } from '@/features/urls/store/urlStore';
import { cn } from '@/lib/utils';
import type { URLWithResult } from '@/shared/types/api';
import { SortOrder, URLSortField } from '@/shared/types/api';
import { Link, useNavigate } from 'react-router-dom';
import { URLCrawlStatusCell } from './crawl/URLCrawlStatusCell';
import { PaginationControls } from './url-table/PaginationControls';
import { SortableHeader } from './url-table/SortableHeader';
import { URLTableEmptyState } from './url-table/URLTableEmptyState';
import { URLTableSkeleton } from './url-table/URLTableSkeleton';

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
  const {
    selectedURLs,
    toggleSelection,
    selectAll,
    clearSelection,
    filters,
    setFilters,
  } = useURLStore();

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
  const isAllSelected =
    data.length > 0 && data.every((url) => selectedURLs.includes(url.id));
  const isSomeSelected = data.some((url) => selectedURLs.includes(url.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      clearSelection();
    } else {
      selectAll(data.map((url) => url.id));
    }
  };

  if (isLoading) {
    return <URLTableSkeleton />;
  }

  if (data.length === 0) {
    return <URLTableEmptyState />;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border min-h-[550px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isSomeSelected && !isAllSelected}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>
                <SortableHeader
                  label="URL"
                  field={URLSortField.URL}
                  currentSortBy={filters.sort_by}
                  currentSortOrder={filters.sort_order}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead>
                <SortableHeader
                  label="Status"
                  field={URLSortField.STATUS}
                  currentSortBy={filters.sort_by}
                  currentSortOrder={filters.sort_order}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead>
                <SortableHeader
                  label="Title"
                  field={URLSortField.TITLE}
                  currentSortBy={filters.sort_by}
                  currentSortOrder={filters.sort_order}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead className="text-center">HTML Version</TableHead>
              <TableHead className="text-center">
                <SortableHeader
                  label="Internal Links"
                  field={URLSortField.INTERNAL_LINKS}
                  currentSortBy={filters.sort_by}
                  currentSortOrder={filters.sort_order}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead className="text-center">
                <SortableHeader
                  label="External Links"
                  field={URLSortField.EXTERNAL_LINKS}
                  currentSortBy={filters.sort_by}
                  currentSortOrder={filters.sort_order}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead className="text-center">
                <SortableHeader
                  label="Broken Links"
                  field={URLSortField.BROKEN_LINKS_COUNT}
                  currentSortBy={filters.sort_by}
                  currentSortOrder={filters.sort_order}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((url) => (
              <TableRow
                key={url.id}
                className={cn(
                  'cursor-pointer',
                  selectedURLs.includes(url.id) && 'bg-muted/50'
                )}
                onClick={() => navigate(`/urls/${url.id}`)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedURLs.includes(url.id)}
                    onCheckedChange={() => toggleSelection(url.id)}
                  />
                </TableCell>
                <TableCell className="font-medium max-w-xs truncate">
                  {url.url}
                </TableCell>
                <TableCell>
                  <URLCrawlStatusCell url={url} />
                  {/* <URLStatusBadge status={url.status} /> */}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {url.crawl_result?.title || '-'}
                </TableCell>
                <TableCell className="text-center">
                  {url.crawl_result?.html_version || '-'}
                </TableCell>
                <TableCell className="text-center">
                  {url.crawl_result?.internal_links ?? '-'}
                </TableCell>
                <TableCell className="text-center">
                  {url.crawl_result?.external_links ?? '-'}
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={cn(
                      url.crawl_result?.broken_links_count &&
                        url.crawl_result.broken_links_count > 0
                        ? 'text-destructive font-medium'
                        : ''
                    )}
                  >
                    {url.crawl_result?.broken_links_count ?? '-'}
                  </span>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Link to={url.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" icon="externalLink" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PaginationControls
        page={pagination.page}
        pageSize={pagination.pageSize}
        total={pagination.total}
        totalPages={pagination.totalPages}
        onPageChange={(page) => setFilters({ page })}
      />
    </div>
  );
}
