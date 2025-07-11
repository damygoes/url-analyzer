import { Button } from '@/components/ui/button';

export function DashboardHeader({ onAddClick }: { onAddClick: () => void }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">URL Dashboard</h1>
        <p className="text-muted-foreground">
          Analyze and monitor website information
        </p>
      </div>

      <Button icon="plus" onClick={onAddClick} className="gap-2">
        Add URL
      </Button>
    </div>
  );
}
