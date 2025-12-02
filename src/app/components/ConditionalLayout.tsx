'use client';

import { usePathname } from 'next/navigation';
import MySideBar from '../(view)/components/MySideBar';
import NotificationIcon from '../(view)/components/notificationIcon';
import { Suspense } from 'react';
import SidebarSkeleton from '../(view)/components/SidebarSkeleton';

interface ConditionalLayoutProps {
  hasActiveRide: boolean;
  children: React.ReactNode;
}

export default function ConditionalLayout({ hasActiveRide, children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Check if current path is an auth page (login or register) or root path
  const shouldHideSidebar = pathname === '/' || pathname?.startsWith('/login') || pathname?.startsWith('/register') || pathname?.startsWith('/forgot-password');

  if (shouldHideSidebar) {
    // Pages without sidebar
    return (
      <div className="min-h-screen bg-light-background dark:bg-dark-background transition-colors duration-300">
        {children}
      </div>
    );
  }

  // Regular pages with sidebar
  return (
    <>
      <Suspense fallback={<SidebarSkeleton />}>
        <MySideBar hasActiveRide={hasActiveRide} />
      </Suspense>
      <NotificationIcon />
      <div className="min-h-screen bg-light-background dark:bg-dark-background transition-colors duration-300 xl:pl-72 p-5 md:p-5">
        {children}
      </div>
    </>
  );
}
