'use client';

import { usePathname } from 'next/navigation';
import SwipeContainer from './SwipeContainer';
import GlobalCreateManager from './GlobalCreateManager';
import { ReactNode } from 'react';

// Import the three main page components
import HomePage from '@/app/page';
import AllTasksPage from '@/app/tasks/page';
import NotesAndListsPage from '@/app/lists/page';

/**
 * ClientRootLayout - Phase 3.6
 *
 * Conditionally renders SwipeContainer for the 3 main pages, or passes through
 * to regular rendering for other pages.
 *
 * Swipe pages:
 * - / (Calendar) - center slide, default
 * - /tasks (All Tasks) - left slide
 * - /lists (Notes & Lists) - right slide
 *
 * Other pages (/habits, /reminders, /settings, etc.) render normally without swipe.
 */

const SWIPE_ROUTES = ['/', '/tasks', '/lists'];

interface ClientRootLayoutProps {
  children: ReactNode;
}

export default function ClientRootLayout({ children }: ClientRootLayoutProps) {
  const pathname = usePathname();

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
      path: '/tasks',
      label: 'Tasks',
      content: <AllTasksPage />,
    },
    {
      path: '/',
      label: 'Calendar',
      content: <HomePage />,
    },
    {
      path: '/lists',
      label: 'Lists',
      content: <NotesAndListsPage />,
    },
  ];

  return (
    <>
      <GlobalCreateManager />
      {!isSwipeRoute ? (
        children
      ) : (
        <SwipeContainer slides={slides} defaultIndex={1} />
      )}
    </>
  );
}
