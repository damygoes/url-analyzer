import { Link } from 'react-router-dom';
import { Button } from '../ui/button';

export function AppErrorBoundary() {
  return (
    <div className="flex flex-col items-center justify-center h-screen p-8 text-center space-y-4">
      <h1 className="text-2xl font-bold text-destructive">
        Something went wrong
      </h1>
      <p className="text-muted-foreground">
        An unexpected error occurred. Please try again later.
      </p>
      <Link to="/health">
        <Button variant="link" icon="health">
          Check System Health
        </Button>
      </Link>
    </div>
  );
}
