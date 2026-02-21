'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

/**
 * BottomTabBar - Phase 4 Group 3
 *
 * 5-tab fixed bottom nav (mobile only, hidden on md+):
 *   Home | All | [+] | Calendar | Vault
 *
 * Create (+): opens a menu that dispatches 'lifeos:create' custom events;
 *   GlobalCreateManager listens and opens the appropriate modal.
 *
 * Calendar: tapping when NOT on calendar navigates to /calendar.
 *   Tapping when ALREADY on a calendar view shows a popup to switch
 *   between Today / Schedule / Week / Month views.
 *
 * Active tab: purple icon/text + thin purple bar at top.
 * iOS safe area handled via paddingBottom inline style on <nav>.
 */

// ─── Tab definitions ─────────────────────────────────────────────────────────

const LEFT_TABS = [
  {
    href: '/',
    label: 'Home',
    isActive: (p: string) => p === '/',
    icon: (active: boolean) => (
      <svg className={`w-6 h-6 ${active ? 'text-purple-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/all',
    label: 'All',
    isActive: (p: string) => p === '/all' || p === '/tasks',
    icon: (active: boolean) => (
      <svg className={`w-6 h-6 ${active ? 'text-purple-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
];

const VAULT_TAB = {
  href: '/vault',
  label: 'Vault',
  isActive: (p: string) => p?.startsWith('/vault') || p?.startsWith('/lists'),
  icon: (active: boolean) => (
    <svg className={`w-6 h-6 ${active ? 'text-purple-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  ),
};

const isCalendarActive = (p: string) => p === '/calendar' || p === '/week';

const CALENDAR_VIEWS = [
  { id: 'timeline', label: 'Today',    description: 'Single day schedule' },
  { id: 'schedule', label: 'Schedule', description: 'Multi-day list view' },
  { id: 'week',     label: 'Week',     description: '7-day grid' },
  { id: 'month',    label: 'Month',    description: 'Calendar overview' },
];

const CREATE_OPTIONS: { type: string; label: string; icon: React.ReactNode }[] = [
  { type: 'task',     label: 'Task',     icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { type: 'habit',    label: 'Habit',    icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> },
  { type: 'reminder', label: 'Reminder', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { type: 'note',     label: 'Note',     icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> },
  { type: 'list',     label: 'List',     icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

interface TabDef {
  href: string;
  label: string;
  isActive: (p: string) => boolean;
  icon: (active: boolean) => React.ReactNode;
}

function NavTab({ tab, pathname }: { tab: TabDef; pathname: string }) {
  const active = tab.isActive(pathname);
  return (
    <Link href={tab.href} className="relative flex flex-col items-center justify-center py-2 gap-0.5">
      {active && <span className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-purple-600 rounded-b" />}
      {tab.icon(active)}
      <span className={`text-[10px] font-medium ${active ? 'text-purple-600' : 'text-gray-500'}`}>
        {tab.label}
      </span>
    </Link>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BottomTabBar() {
  const { data: session } = useSession();
  const pathname = usePathname() ?? '';
  const router = useRouter();

  const [createOpen, setCreateOpen]           = useState(false);
  const [calViewOpen, setCalViewOpen]         = useState(false);
  // Track which calendar view is active so we can highlight it in the popup.
  // Read from window.location at click time (avoids needing useSearchParams/Suspense).
  const [activeCalView, setActiveCalView]     = useState('timeline');

  if (!session?.user) return null;

  const anyMenuOpen = createOpen || calViewOpen;

  function closeAll() {
    setCreateOpen(false);
    setCalViewOpen(false);
  }

  function handleCreate(type: string) {
    window.dispatchEvent(new CustomEvent('lifeos:create', { detail: { type } }));
    closeAll();
  }

  function handleCalendarTabClick() {
    if (isCalendarActive(pathname)) {
      // Already on a calendar view — read current view from URL and show switcher
      const params = new URLSearchParams(window.location.search);
      setActiveCalView(params.get('view') || 'timeline');
      setCalViewOpen(!calViewOpen);
      setCreateOpen(false);
    } else {
      // Navigate to calendar (default view)
      router.push('/calendar');
    }
  }

  const calActive = isCalendarActive(pathname);
  const vaultActive = VAULT_TAB.isActive(pathname);

  return (
    <>
      {/* Backdrop — closes any open menu */}
      {anyMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={closeAll} />
      )}

      <nav
        className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-200 z-40"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-5">

          {/* Left tabs: Home, All */}
          {LEFT_TABS.map((tab) => (
            <NavTab key={tab.href} tab={tab} pathname={pathname} />
          ))}

          {/* Center create button */}
          <button
            onClick={() => { setCreateOpen(!createOpen); setCalViewOpen(false); }}
            className="flex flex-col items-center justify-center py-2 gap-0.5"
            aria-label="Create new item"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              createOpen ? 'bg-gray-800 rotate-45' : 'bg-purple-600'
            }`}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </button>

          {/* Calendar tab — with view-switcher popup when tapped while active */}
          <div className="relative">
            <button
              onClick={handleCalendarTabClick}
              className="relative flex flex-col items-center justify-center py-2 gap-0.5 w-full"
              aria-label="Calendar"
            >
              {calActive && <span className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-purple-600 rounded-b" />}
              <svg className={`w-6 h-6 ${calActive ? 'text-purple-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className={`text-[10px] font-medium ${calActive ? 'text-purple-600' : 'text-gray-500'}`}>
                Calendar
              </span>
            </button>

            {/* Calendar view-switcher popup — anchored above the Calendar tab */}
            {calViewOpen && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 bg-white rounded-lg shadow-xl border border-gray-200 py-1 overflow-hidden z-50">
                {CALENDAR_VIEWS.map((view) => {
                  const isCurrent = activeCalView === view.id;
                  return (
                    <Link
                      key={view.id}
                      href={`/calendar?view=${view.id}`}
                      onClick={closeAll}
                      className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                        isCurrent ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isCurrent ? 'bg-purple-600' : 'bg-transparent'}`} />
                      <span className="font-medium">{view.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Vault tab */}
          <Link href="/vault" className="relative flex flex-col items-center justify-center py-2 gap-0.5">
            {vaultActive && <span className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-purple-600 rounded-b" />}
            {VAULT_TAB.icon(vaultActive)}
            <span className={`text-[10px] font-medium ${vaultActive ? 'text-purple-600' : 'text-gray-500'}`}>
              Vault
            </span>
          </Link>

        </div>

        {/* Create menu — centered above the tab bar */}
        {createOpen && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 overflow-hidden z-50">
            {CREATE_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                onClick={() => handleCreate(opt.type)}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span className="w-4 h-4 text-gray-400">{opt.icon}</span>
                <span className="font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        )}
      </nav>
    </>
  );
}
