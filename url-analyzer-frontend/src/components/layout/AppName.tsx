import { Icon } from '../ui/icon/Icon';

export function AppName() {
  return (
    <div className="flex items-center gap-1">
      <Icon name="link" className="text-primary" />
      <h1 className="text-sm lg:text-lg font-semibold">URL Analyzer</h1>
    </div>
  );
}
