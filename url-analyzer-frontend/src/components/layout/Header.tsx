import { Button } from '@/components/ui/button';
import { AppName } from './AppName';

interface HeaderProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

export function Header({ onMenuClick, isSidebarOpen }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
            icon={isSidebarOpen ? 'close' : 'menu'}
          >
            <span className="sr-only">Toggle menu</span>
          </Button>

          <AppName />
        </div>

        {/* <div className="hidden sm:flex items-center gap-2">
          <LogoutButton />
        </div> */}
      </div>
    </header>
  );
}
