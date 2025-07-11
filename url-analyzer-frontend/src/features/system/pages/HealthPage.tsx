import { ActiveJobsCard } from '../components/ActiveJobsCard';
import { CrawlerConfigCard } from '../components/CrawlerConfigCard';
import { DatabaseErrorAlert } from '../components/DatabaseErrorAlert';
import { DatabaseStatsCard } from '../components/DatabaseStatsCard';
import { HealthPageSkeleton } from '../components/HealthPageSkeleton';
import { SystemStatusCard } from '../components/SystemStatusCard';
import { useHealth, useStats } from '../hooks/useSystem';

export function HealthPage() {
  const { data: health, isLoading: healthLoading } = useHealth();
  const { data: stats, isLoading: statsLoading } = useStats();

  const isLoading = healthLoading || statsLoading;

  if (isLoading) {
    return <HealthPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
        <p className="text-muted-foreground">
          Monitor system status and performance metrics
        </p>
      </div>

      {health && (
        <SystemStatusCard
          status={health.status}
          database={health.database}
          memory_mb={health.memory_mb}
          goroutines={health.goroutines}
          uptime={health.uptime}
          version={health.version}
        />
      )}

      {stats && (
        <>
          <DatabaseStatsCard stats={stats.database} />
          <CrawlerConfigCard config={stats.crawler} />
          {stats.active_jobs > 0 && <ActiveJobsCard jobs={stats.jobs_detail} />}
        </>
      )}

      {health?.database_error && <DatabaseErrorAlert error={health.database_error} />}
    </div>
  );
}