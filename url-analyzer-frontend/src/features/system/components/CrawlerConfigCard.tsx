import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon/Icon';

interface CrawlerConfig {
  timeout: string;
  max_redirects: number;
  user_agent: string;
  check_broken_links: boolean;
  max_links_to_check: number;
  concurrent_checks: number;
}

interface CrawlerConfigCardProps {
  config: CrawlerConfig;
}

export function CrawlerConfigCard({ config }: CrawlerConfigCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="globe" />
          Crawler Configuration
        </CardTitle>
        <CardDescription>Current crawler settings and capabilities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Timeout</p>
              <p className="font-mono text-sm">{config.timeout}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Max Redirects</p>
              <p className="font-mono text-sm">{config.max_redirects}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">User Agent</p>
              <p className="font-mono text-sm break-all">{config.user_agent}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Check Broken Links</p>
              <Badge variant={config.check_broken_links ? 'default' : 'secondary'}>
                {config.check_broken_links ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Max Links to Check</p>
              <p className="font-mono text-sm">{config.max_links_to_check}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Concurrent Checks</p>
              <p className="font-mono text-sm">{config.concurrent_checks}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
