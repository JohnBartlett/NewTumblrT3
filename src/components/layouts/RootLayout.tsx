import { Outlet } from '@tanstack/react-router';

import { Navigation } from '@/components/navigation/Navigation';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { useAuth } from '@/hooks/queries/useAuth';

export function RootLayout() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <main className={currentUser ? 'pb-20 md:pb-0' : ''}>
        <Outlet />
      </main>
      {currentUser && <MobileBottomNav />}
    </div>
  );
}