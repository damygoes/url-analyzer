import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TableCell, TableRow } from '@/components/ui/table';
import { URLCrawlStatusCell } from '@/features/url-analysis/components/URLCrawlStatusCell';
import { cn } from '@/lib/utils';
import type { URLWithResult } from '@/shared/types/api';
import { Link } from 'react-router-dom';

interface URLTableRowProps {
  url: URLWithResult;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
  isDisabled: boolean;
  onRowClick: (id: number) => void;
}

export function URLTableRow({
  url,
  isSelected,
  onToggleSelect,
  isDisabled,
  onRowClick,
}: URLTableRowProps) {
  return (
    <TableRow
      className={cn('cursor-pointer', isSelected && 'bg-muted/50')}
      onClick={() => onRowClick(url.id)}
    >
      <TableCell onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(url.id)}
          disabled={isDisabled}
        />
      </TableCell>
      <TableCell className="font-medium max-w-xs truncate">{url.url}</TableCell>
      <TableCell>
        <URLCrawlStatusCell url={url} />
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
  );
}
