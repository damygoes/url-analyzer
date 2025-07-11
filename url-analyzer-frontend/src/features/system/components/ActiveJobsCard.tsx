import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon/Icon';

interface Job {
  url: string;
  status: string;
  progress: number;
  message?: string;
}

interface ActiveJobsCardProps {
  jobs: Record<string, Job>;
}

export function ActiveJobsCard({ jobs }: ActiveJobsCardProps) {
  if (!jobs || Object.keys(jobs).length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="cpu" />
          Active Jobs
        </CardTitle>
        <CardDescription>Currently running crawl jobs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(jobs).map(([id, job]) => (
            <div key={id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{job.url}</p>
                  <p className="text-xs text-muted-foreground">
                    Status: {job.status} • Progress: {job.progress}%
                  </p>
                  {job.message && (
                    <p className="text-xs text-muted-foreground">{job.message}</p>
                  )}
                </div>
                <Badge>{job.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
