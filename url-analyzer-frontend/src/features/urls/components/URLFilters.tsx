import { Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useURLStore } from '@/features/urls/store/urlStore';
import { useDebounce } from '@/hooks/useDebounce';
import { URLStatus } from '@/shared/types/api';
import { PageSizeOptions } from './url-table/PageSizeOptions';

export function URLFilters() {
  const { filters, setFilters, resetFilters } = useURLStore();

  const [searchInput, setSearchInput] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchInput, 300);

  // Sync debounced search with filters
  useEffect(() => {
    setFilters({ search: debouncedSearch || undefined, page: 1 });
  }, [debouncedSearch, setFilters]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchInput(e.target.value);
    },
    []
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      const status = value === 'all' ? undefined : (value as URLStatus);
      setFilters({ status, page: 1 });
    },
    [setFilters]
  );

  const handlePageSizeChange = useCallback(
    (value: string) => {
      setFilters({ page_size: Number(value), page: 1 });
    },
    [setFilters]
  );

  const handleReset = useCallback(() => {
    setSearchInput('');
    resetFilters();
  }, [resetFilters]);

  const hasActiveFilters = useMemo(
    () => Boolean(filters.search || filters.status),
    [filters.search, filters.status]
  );

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search URLs..."
            value={searchInput}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>

        <Select
          value={filters.status || 'all'}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value={URLStatus.QUEUED}>Queued</SelectItem>
            <SelectItem value={URLStatus.RUNNING}>Running</SelectItem>
            <SelectItem value={URLStatus.COMPLETED}>Completed</SelectItem>
            <SelectItem value={URLStatus.ERROR}>Error</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            className="h-9 w-9"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear filters</span>
          </Button>
        )}
      </div>

      <Select
        value={(filters.page_size ?? 10).toString()}
        onValueChange={handlePageSizeChange}
      >
        <SelectTrigger className="w-[100px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <PageSizeOptions />
        </SelectContent>
      </Select>
    </div>
  );
}
