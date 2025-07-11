import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { getTotalLinks } from '../utils/urlDetailsUtils';

interface StatsGridProps {
  htmlVersion?: string | null;
  internalLinks?: number | null;
  externalLinks?: number | null;
  brokenLinksCount?: number | null;
  hasLoginForm?: boolean;
}

export function StatsGrid({
  htmlVersion,
  internalLinks,
  externalLinks,
  brokenLinksCount,
  hasLoginForm,
}: StatsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">HTML Version</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{htmlVersion || 'Unknown'}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Total Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {getTotalLinks(internalLinks ?? 0, externalLinks ?? 0)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Broken Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            {brokenLinksCount ?? 0}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Login Form</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{hasLoginForm ? 'Yes' : 'No'}</div>
        </CardContent>
      </Card>
    </div>
  );
}
