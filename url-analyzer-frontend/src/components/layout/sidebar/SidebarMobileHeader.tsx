import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon/Icon';
import { AppName } from '../AppName';

interface SidebarMobileHeaderProps {
  onClose: () => void;
}

export function SidebarMobileHeader({ onClose }: SidebarMobileHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 lg:hidden">
      <AppName />
      <Button variant="ghost" size="icon" onClick={onClose}>
        <Icon name="close" />
      </Button>
    </div>
  );
}
