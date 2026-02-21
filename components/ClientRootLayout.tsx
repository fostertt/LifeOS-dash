'use client';

import GlobalCreateManager from './GlobalCreateManager';
import BottomTabBar from './BottomTabBar';
import { ReactNode } from 'react';

/**
 * ClientRootLayout - UI Polish Phase 1 + Phase 4 Group 3
 *
 * GlobalCreateManager (FAB) is always available for quick actions.
 * BottomTabBar provides primary mobile navigation (hidden on md+).
 * pb-16 md:pb-0 on the content wrapper prevents pages from rendering
 * behind the fixed bottom tab bar on mobile.
 */

interface ClientRootLayoutProps {
  children: ReactNode;
}

export default function ClientRootLayout({ children }: ClientRootLayoutProps) {
  return (
    <>
      <GlobalCreateManager />
      <div className="pb-16 md:pb-0">
        {children}
      </div>
      <BottomTabBar />
    </>
  );
}
