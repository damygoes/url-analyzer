import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon/Icon';
import { SortOrder, URLSortField } from '@/shared/types/api';

interface SortableHeaderProps {
  label: string;
  field: URLSortField;
  currentSortBy?: URLSortField;
  currentSortOrder?: SortOrder;
  onSort: (field: URLSortField) => void;
  className?: string;
}

export function SortableHeader({
  label,
  field,
  currentSortBy,
  currentSortOrder,
  onSort,
  className = '',
}: SortableHeaderProps) {
  const renderIcon = () => {
    if (currentSortBy !== field)
      return <Icon name="arrow-up-down" className="ml-2" />;
    return currentSortOrder === SortOrder.ASC ? (
      <Icon name="arrow-up" className="ml-2" />
    ) : (
      <Icon name="arrow-down" className="ml-2" />
    );
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`-ml-3 h-8 data-[state=open]:bg-accent ${className}`}
      onClick={() => onSort(field)}
    >
      {label}
      {renderIcon()}
    </Button>
  );
}
