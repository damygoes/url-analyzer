import { SelectContent, SelectItem } from '@/components/ui/select';

export function PageSizeOptions() {
  return (
    <SelectContent>
      <SelectItem value="10">10 rows</SelectItem>
      <SelectItem value="25">25 rows</SelectItem>
      <SelectItem value="50">50 rows</SelectItem>
      <SelectItem value="100">100 rows</SelectItem>
    </SelectContent>
  );
}
