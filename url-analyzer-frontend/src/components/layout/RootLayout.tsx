import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';

export function RootLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex h-[calc(100vh-3.5rem)]">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main
          className={cn(
            'flex-1 overflow-y-auto bg-muted/30',
            'transition-all duration-300 ease-in-out',
            sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
          )}
        >
          <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
