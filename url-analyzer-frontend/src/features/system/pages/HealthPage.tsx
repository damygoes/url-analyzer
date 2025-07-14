import { useMemo } from 'react';

import { ActiveJobsCard } from '../components/ActiveJobsCard';
import { CrawlerConfigCard } from '../components/CrawlerConfigCard';
import { DatabaseStatsCard } from '../components/DatabaseStatsCard';
import { HealthErrorState } from '../components/HealthErrorState';
import { HealthPageSkeleton } from '../components/HealthPageSkeleton';
import { useHealth, useStats } from '../hooks/useSystem';
import { HealthStatusSection } from '../sections/HealthStatusSection';

export function HealthPage() {
  const {
    data: health,
    isLoading: healthLoading,
    error: healthError,
  } = useHealth();
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useStats();

  const isLoading = useMemo(
    () => healthLoading || statsLoading,
    [healthLoading, statsLoading]
  );
  const hasError = useMemo(
    () => healthError || statsError,
    [healthError, statsError]
  );

  if (isLoading) {
    return <HealthPageSkeleton />;
  }

  if (hasError || !health || !stats) {
    return <HealthErrorState />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
        <p className="text-muted-foreground">
          Monitor system status and performance metrics
        </p>
      </div>

      <HealthStatusSection health={health} />

      <DatabaseStatsCard stats={stats.database} />
      <CrawlerConfigCard config={stats.crawler} />

      {stats.active_jobs > 0 && <ActiveJobsCard jobs={stats.jobs_detail} />}
    </div>
  );
}
