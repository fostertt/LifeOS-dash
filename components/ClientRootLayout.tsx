'use client';

import GlobalCreateManager from './GlobalCreateManager';
import { ReactNode } from 'react';

/**
 * ClientRootLayout - UI Polish Phase 1
 *
 * Simplified layout that always renders children directly.
 * Swipe navigation has been disabled for cleaner UX.
 *
 * GlobalCreateManager (FAB) is always available for quick actions.
 */

interface ClientRootLayoutProps {
  children: ReactNode;
}

export default function ClientRootLayout({ children }: ClientRootLayoutProps) {
  return (
    <>
      <GlobalCreateManager />
      {children}
    </>
  );
}
