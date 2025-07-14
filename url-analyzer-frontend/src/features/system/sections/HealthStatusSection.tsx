import { DatabaseErrorAlert } from '../components/DatabaseErrorAlert';
import { SystemStatusCard } from '../components/SystemStatusCard';
import type { useHealth } from '../hooks/useSystem';

type HealthStatusSectionProps = {
  health: NonNullable<ReturnType<typeof useHealth>['data']>;
};

export function HealthStatusSection({ health }: HealthStatusSectionProps) {
  return (
    <>
      <SystemStatusCard
        status={health.status}
        database={health.database}
        memory_mb={health.memory_mb}
        goroutines={health.goroutines}
        uptime={health.uptime}
        version={health.version}
      />

      {health.database_error && (
        <DatabaseErrorAlert error={health.database_error} />
      )}
    </>
  );
}
