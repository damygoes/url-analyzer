import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Icon } from '@/components/ui/icon/Icon';
import { formatStatLabel } from '../utils/systemUtils';

interface DatabaseStats {
  queued: number;
  running: number;
  completed: number;
  error: number;
  total_crawl_results: number;
  total_broken_links: number;
}

interface DatabaseStatsCardProps {
  stats: DatabaseStats;
}

export function DatabaseStatsCard({ stats }: DatabaseStatsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="database" />
          Database Statistics
        </CardTitle>
        <CardDescription>
          Current state of URLs and crawl results
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {formatStatLabel(key)}
              </p>
              <p
                className={`text-2xl font-bold ${
                  key === 'running'
                    ? 'text-blue-500'
                    : key === 'completed'
                      ? 'text-green-500'
                      : key === 'error'
                        ? 'text-destructive'
                        : ''
                }`}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
