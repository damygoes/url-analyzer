import { TableHead, TableRow } from '@/components/ui/table';

export function BrokenLinksTableHeader() {
  return (
    <TableRow>
      <TableHead>URL</TableHead>
      <TableHead>Type</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Link Text</TableHead>
      <TableHead className="w-[50px]" />
    </TableRow>
  );
}
