import { Checkbox } from '@/components/ui/checkbox';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SortOrder, URLSortField } from '@/shared/types/api';
import { SortableHeader } from '../url-table/SortableHeader';

interface URLTableHeaderProps {
  currentSortBy: URLSortField | undefined;
  currentSortOrder: SortOrder | undefined;
  onSort: (field: URLSortField) => void;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  onSelectAll: () => void;
}

export function URLTableHeader({
  currentSortBy,
  currentSortOrder,
  onSort,
  isAllSelected,
  isSomeSelected,
  onSelectAll,
}: URLTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-12">
          <Checkbox
            checked={isAllSelected}
            indeterminate={isSomeSelected && !isAllSelected}
            onCheckedChange={onSelectAll}
            aria-label="Select all URLs"
          />
        </TableHead>
        <TableHead>
          <SortableHeader
            label="URL"
            field={URLSortField.URL}
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
            onSort={onSort}
          />
        </TableHead>
        <TableHead>
          <SortableHeader
            label="Status"
            field={URLSortField.STATUS}
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
            onSort={onSort}
          />
        </TableHead>
        <TableHead>
          <SortableHeader
            label="Title"
            field={URLSortField.TITLE}
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
            onSort={onSort}
          />
        </TableHead>
        <TableHead className="text-center">HTML Version</TableHead>
        <TableHead className="text-center">
          <SortableHeader
            label="Internal Links"
            field={URLSortField.INTERNAL_LINKS}
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
            onSort={onSort}
          />
        </TableHead>
        <TableHead className="text-center">
          <SortableHeader
            label="External Links"
            field={URLSortField.EXTERNAL_LINKS}
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
            onSort={onSort}
          />
        </TableHead>
        <TableHead className="text-center">
          <SortableHeader
            label="Broken Links"
            field={URLSortField.BROKEN_LINKS_COUNT}
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
            onSort={onSort}
          />
        </TableHead>
        <TableHead className="w-12" />
      </TableRow>
    </TableHeader>
  );
}