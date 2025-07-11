import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from '../ui/sonner';

export function RootLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header
        onMenuClick={() => setSidebarOpen((prev) => !prev)}
        isSidebarOpen={sidebarOpen}
      />

      <div className="flex h-[calc(100vh-3.5rem)]">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main
          className={cn(
            'overflow-y-auto overflow-x-hidden bg-background flex-1 mx-auto p-4 lg:ml-2 sm:p-6 lg:p-8'
          )}
        >
          <Outlet />
        </main>
        <Toaster />
      </div>
    </div>
  );
}
