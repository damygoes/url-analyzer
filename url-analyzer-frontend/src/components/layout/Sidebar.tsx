import { LogoutButton } from '@/features/auth/components/LogoutButton';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import type { IconName } from '../ui/icon/iconMapping';
import { SidebarMobileHeader } from './sidebar/SidebarMobileHeader';
import { SidebarNavLinks } from './sidebar/SidebarNavLinks';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' as IconName },
  { name: 'System Health', href: '/health', icon: 'activity' as IconName },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const [collapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden',
          open
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed z-50 top-0 left-0 h-full w-56 p-2 border-r bg-background transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:relative lg:translate-x-0 lg:top-0 lg:h-[calc(100vh-3.5rem)]',
          collapsed && 'lg:w-16'
        )}
      >
        <div className="flex h-full flex-col lg:pt-0">
          {/* Mobile Header */}
          <SidebarMobileHeader onClose={onClose} />
          <SidebarNavLinks
            items={navigation}
            collapsed={collapsed}
            onLinkClick={onClose}
          />

          {/* Mobile-only Logout */}
          <div className="mt-auto border-t p-4 lg:hidden">
            <LogoutButton className="w-full" />
          </div>
        </div>
      </aside>
    </>
  );
}
