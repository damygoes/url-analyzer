import { Icon } from '../ui/icon/Icon';

export function LoadingComponent() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <Icon name="loading" className="animate-spin text-primary" />
      <p className="ml-4 text-lg">Loading...</p>
    </div>
  );
}
