'use client';

import { usePathname } from 'next/navigation';
import SwipeContainer from './SwipeContainer';
import GlobalCreateManager from './GlobalCreateManager';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { ReactNode } from 'react';

// Import the three main page components
import HomePage from '@/app/page';
import AllTasksPage from '@/app/all/page';
import NotesAndListsPage from '@/app/vault/page';

/**
 * ClientRootLayout - Phase 3.6
 *
 * Conditionally renders SwipeContainer for the 3 main pages, or passes through
 * to regular rendering for other pages.
 *
 * Swipe pages:
 * - / (Home) - center slide, default
 * - /all (All Tasks) - left slide
 * - /vault (Vault) - right slide
 *
 * Other pages (/calendar, /projects, /recipes, /settings, etc.) render normally without swipe.
 */

const SWIPE_ROUTES = ['/', '/all', '/vault'];

interface ClientRootLayoutProps {
  children: ReactNode;
}

export default function ClientRootLayout({ children }: ClientRootLayoutProps) {
  const pathname = usePathname();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  // Check if we're on one of the 3 main swipeable pages
  // Use startsWith for /lists to handle /lists/[id] detail pages
  const isSwipeRoute = SWIPE_ROUTES.some(route => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  });

  // Render SwipeContainer with all 3 main pages pre-rendered
  const slides = [
    {
      path: '/all',
      label: 'All',
      content: <AllTasksPage />,
    },
    {
      path: '/',
      label: 'Home',
      content: <HomePage />,
    },
    {
      path: '/vault',
      label: 'Vault',
      content: <NotesAndListsPage />,
    },
  ];

  // Logic:
  // 1. Always render GlobalCreateManager (FAB)
  // 2. If NOT a swipe route, render children normally
  // 3. If IS a swipe route but we are on DESKTOP, render children normally (restore desktop layout)
  // 4. If IS a swipe route AND on MOBILE, render SwipeContainer

  return (
    <>
      <GlobalCreateManager />
      {!isSwipeRoute || isDesktop ? (
        children
      ) : (
        <SwipeContainer slides={slides} defaultIndex={1} />
      )}
    </>
  );
}
