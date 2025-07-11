import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon/Icon';

interface SystemStatusCardProps {
  status: string;
  database: string;
  memory_mb: number;
  goroutines: number;
  uptime: string;
  version: string;
  database_error?: string;
}

export function SystemStatusCard({
  status,
  database,
  memory_mb,
  goroutines,
  uptime,
  version,
}: SystemStatusCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="activity" />
          System Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Status</p>
            <div className="flex items-center gap-2">
              {status === 'ok' ? (
                <>
                  <Icon name="completed" className="text-green-500" />
                  <span className="font-semibold text-green-500">Healthy</span>
                </>
              ) : (
                <>
                  <Icon name="error" className="text-destructive" />
                  <span className="font-semibold text-destructive">
                    Unhealthy
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Database</p>
            <div className="flex items-center gap-2">
              {database === 'healthy' ? (
                <>
                  <Icon name="database" className="text-green-500" />
                  <span className="font-semibold">Connected</span>
                </>
              ) : (
                <>
                  <Icon name="database" className="text-destructive" />
                  <span className="font-semibold text-destructive">
                    Disconnected
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Memory Usage</p>
            <p className="text-2xl font-bold">{memory_mb} MB</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Goroutines</p>
            <p className="text-2xl font-bold">{goroutines}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Uptime</p>
            <p className="font-mono text-sm">{uptime}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Version</p>
            <p className="font-mono text-sm">{version}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
