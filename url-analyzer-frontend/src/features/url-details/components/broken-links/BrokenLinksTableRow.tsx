import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon/Icon';
import { TableCell, TableRow } from '@/components/ui/table';
import type { BrokenLink } from '@/shared/types/api';
import { Link } from 'react-router-dom';
import { getStatusBadgeVariant, getStatusLabel } from './getStatusUtils';

export function BrokenLinksTableRow({ link }: { link: BrokenLink }) {
  return (
    <TableRow key={link.id}>
      <TableCell className="max-w-[300px]">
        <div className="truncate text-sm">{link.url}</div>
        {link.error_message && (
          <p className="mt-1 text-xs text-muted-foreground">
            {link.error_message}
          </p>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {link.is_internal ? (
            <>
              <Icon name="link" size="sm" />
              <span className="text-sm">Internal</span>
            </>
          ) : (
            <>
              <Icon name="externalLink" size="sm" />
              <span className="text-sm">External</span>
            </>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={getStatusBadgeVariant(link.status_code)}>
          {link.status_code} - {getStatusLabel(link.status_code)}
        </Badge>
      </TableCell>
      <TableCell className="max-w-[200px]">
        <div className="truncate text-sm text-muted-foreground">
          {link.link_text || '-'}
        </div>
      </TableCell>
      <TableCell>
        <Link to={link.url} target="_blank" rel="noopener noreferrer">
          <Button icon="externalLink" variant="ghost" size="icon">
            <span className="sr-only">Open link</span>
          </Button>
        </Link>
      </TableCell>
    </TableRow>
  );
}
