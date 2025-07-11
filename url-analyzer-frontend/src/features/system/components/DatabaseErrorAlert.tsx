import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icon } from '@/components/ui/icon/Icon';

interface DatabaseErrorAlertProps {
  error: string;
}

export function DatabaseErrorAlert({ error }: DatabaseErrorAlertProps) {
  if (!error) return null;

  return (
    <Alert variant="destructive">
      <Icon name="alert-circle" className="h-4 w-4" />
      <AlertDescription>Database Error: {error}</AlertDescription>
    </Alert>
  );
}
