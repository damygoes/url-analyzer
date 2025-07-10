import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon/Icon';

interface SidebarCollapseToggleProps {
  collapsed: boolean;
  toggle: () => void;
}

export function SidebarCollapseToggle({
  collapsed,
  toggle,
}: SidebarCollapseToggleProps) {
  return (
    <div className="hidden border-t p-2 lg:block">
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-center"
        onClick={toggle}
      >
        {collapsed ? <Icon name="right" /> : <Icon name="left" />}
      </Button>
    </div>
  );
}
