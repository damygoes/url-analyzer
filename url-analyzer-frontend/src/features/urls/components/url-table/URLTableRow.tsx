import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TableCell, TableRow } from '@/components/ui/table';
import { URLCrawlStatusCell } from '@/features/url-analysis/components/URLCrawlStatusCell';
import { cn } from '@/lib/utils';
import type { URLWithResult } from '@/shared/types/api';
import { useCallback } from 'react';
import { Link } from 'react-router-dom';

interface URLTableRowProps {
  url: URLWithResult;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
  isDisabled: boolean;
  onRowClick: () => void;
}

export function URLTableRow({
  url,
  isSelected,
  onToggleSelect,
  isDisabled,
  onRowClick,
}: URLTableRowProps) {
  const result = url.crawl_result;

  const handleToggle = useCallback(() => {
    onToggleSelect(url.id);
  }, [onToggleSelect, url.id]);

  const stopClickPropagation = useCallback(
    (e: React.MouseEvent) => e.stopPropagation(),
    []
  );

  return (
    <TableRow
      className={cn('cursor-pointer', isSelected && 'bg-muted/50')}
      onClick={onRowClick}
    >
      <TableCell onClick={stopClickPropagation}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={handleToggle}
          disabled={isDisabled}
        />
      </TableCell>
      <TableCell className="font-medium max-w-xs truncate">{url.url}</TableCell>
      <TableCell>
        <URLCrawlStatusCell url={url} />
      </TableCell>
      <TableCell className="max-w-xs truncate">
        {result?.title ?? '-'}
      </TableCell>
      <TableCell className="text-center">
        {result?.html_version ?? '-'}
      </TableCell>
      <TableCell className="text-center">
        {result?.internal_links ?? '-'}
      </TableCell>
      <TableCell className="text-center">
        {result?.external_links ?? '-'}
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
          {result?.broken_links_count ?? '-'}
        </span>
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <Link to={url.url} target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="icon" icon="externalLink" />
        </Link>
      </TableCell>
    </TableRow>
  );
}
