export function URLTableEmptyState() {
  return (
    <div className="text-center py-8 min-h-[550px] flex flex-col justify-center items-center">
      <h3 className="text-muted-foreground">No URLs found</h3>
      <p className="text-sm text-muted-foreground">
        Add a URL to start analyzing its structure and content.
      </p>
    </div>
  );
}
