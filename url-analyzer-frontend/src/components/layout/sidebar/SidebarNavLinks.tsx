import { Icon } from '@/components/ui/icon/Icon';
import type { IconName } from '@/components/ui/icon/iconMapping';
import { cn } from '@/lib/utils';
import { NavLink } from 'react-router-dom';

interface NavItem {
  name: string;
  href: string;
  icon: IconName;
}

interface SidebarNavLinksProps {
  items: NavItem[];
  collapsed: boolean;
  onLinkClick?: () => void;
}

export function SidebarNavLinks({
  items,
  collapsed,
  onLinkClick,
}: SidebarNavLinksProps) {
  return (
    <nav className="space-y-3 px-2 py-4">
      {items.map((item) => (
        <NavLink
          key={item.name}
          to={item.href}
          onClick={onLinkClick}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              isActive
                ? 'bg-primary text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground'
                : 'text-muted-foreground'
            )
          }
        >
          <Icon name={item.icon} size="lg" />
          <span className={cn('transition-opacity', collapsed && 'lg:hidden')}>
            {item.name}
          </span>
        </NavLink>
      ))}
    </nav>
  );
}
