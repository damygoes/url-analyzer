import { Button } from '@/components/ui/button';

interface ActionButtonsProps {
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onRestart: () => void;
  isStartLoading: boolean;
  isStopLoading: boolean;
  isRestartLoading: boolean;
}

export function ActionButtons({
  isRunning,
  onStart,
  onStop,
  onRestart,
  isStartLoading,
  isStopLoading,
  isRestartLoading,
}: ActionButtonsProps) {
  return (
    <div className="flex gap-2">
      {!isRunning && (
        <Button
          icon="play"
          onClick={onStart}
          disabled={isStartLoading}
          className="gap-2"
        >
          Start Analysis
        </Button>
      )}
      {isRunning && (
        <>
          <Button
            onClick={onStop}
            disabled={isStopLoading}
            className="gap-2"
            variant="destructive"
            icon="stop"
          >
            Stop Analysis
          </Button>
          <Button
            icon="refresh"
            onClick={onRestart}
            disabled={isRestartLoading}
            className="gap-2"
          >
            Restart Analysis
          </Button>
        </>
      )}
    </div>
  );
}
