export function HealthErrorState() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
      <p className="text-muted-foreground">
        Monitor system status and performance metrics
      </p>
      <p className="text-sm text-destructive">
        Failed to load system data. Please try again later.
      </p>
    </div>
  );
}
