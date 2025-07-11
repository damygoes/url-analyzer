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
import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function URLFilters() {
  const { filters, setFilters, resetFilters } = useURLStore();
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    setFilters({ search: debouncedSearch, page: 1 });
  }, [debouncedSearch, setFilters]);

  const handleStatusChange = (value: string) => {
    if (value === 'all') {
      setFilters({ status: undefined, page: 1 });
    } else {
      setFilters({ status: value as URLStatus, page: 1 });
    }
  };

  const handleReset = () => {
    setSearchInput('');
    resetFilters();
  };

  const hasActiveFilters = filters.status || filters.search;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search URLs..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
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
        value={filters.page_size?.toString() || '10'}
        onValueChange={(value) =>
          setFilters({ page_size: Number(value), page: 1 })
        }
      >
        <SelectTrigger className="w-[100px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="10">10 rows</SelectItem>
          <SelectItem value="25">25 rows</SelectItem>
          <SelectItem value="50">50 rows</SelectItem>
          <SelectItem value="100">100 rows</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
