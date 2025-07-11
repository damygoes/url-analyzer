import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableHeader } from '@/components/ui/table';
import type { BrokenLink } from '@/shared/types/api';
import { BrokenLinksTableHeader } from './BrokenLinksTableHeader';
import { BrokenLinksTableRow } from './BrokenLinksTableRow';

interface BrokenLinksTableProps {
  links: BrokenLink[];
}

export function BrokenLinksTable({ links }: BrokenLinksTableProps) {
  if (links.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No broken links found
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] rounded-md border">
      <Table>
        <TableHeader>
          <BrokenLinksTableHeader />
        </TableHeader>
        <TableBody>
          {links.map((link) => (
            <BrokenLinksTableRow key={link.id} link={link} />
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
