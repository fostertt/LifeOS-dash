'use client';

import { createContext, useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { usePathname, useRouter } from 'next/navigation';

// Context to signal pages they're inside SwipeContainer
export const SwipeContext = createContext({ insideSwipe: false });

/**
 * SwipeContainer - Phase 3.6 Focused Mode Navigation
 *
 * Renders all 3 main pages in a swipeable carousel:
 * - Slide 0 (left): All Tasks
 * - Slide 1 (center): Calendar (default)
 * - Slide 2 (right): Notes & Lists
 *
 * Features:
 * - Touch/swipe gestures via Embla Carousel
 * - Keyboard navigation (arrow keys)
 * - Page indicators (tappable to jump)
 * - URL syncing - swipe updates URL, URL loads correct slide
 * - Persists last viewed page in localStorage
 */

interface SwipeContainerProps {
  slides: {
    path: string;
    label: string;
    content: React.ReactNode;
  }[];
  defaultIndex?: number;
}

const LAST_PAGE_KEY = 'lifeos-last-page';

export default function SwipeContainer({ slides, defaultIndex = 1 }: SwipeContainerProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Initialize Embla Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    skipSnaps: false,
    dragFree: false,
    containScroll: 'trimSnaps',
    slidesToScroll: 1,
  });

  // Track current slide index
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex);

  /**
   * Get slide index from pathname
   */
  const getIndexFromPath = useCallback((path: string): number => {
    const index = slides.findIndex(s => {
      // Match exact path or path prefix (for nested routes like /lists/[id])
      return path === s.path || path.startsWith(s.path + '/');
    });
    return index !== -1 ? index : defaultIndex;
  }, [slides, defaultIndex]);

  /**
   * Navigate to a specific slide (updates URL and scrolls)
   */
  const navigateToSlide = useCallback((index: number) => {
    if (index < 0 || index >= slides.length) return;

    const slide = slides[index];

    // Update URL (use replace to avoid cluttering history on swipe)
    router.replace(slide.path);

    // Save to localStorage
    localStorage.setItem(LAST_PAGE_KEY, index.toString());

    // Scroll to slide
    if (emblaApi) {
      emblaApi.scrollTo(index);
    }
  }, [slides, router, emblaApi]);

  /**
   * Handle Embla select event (when user swipes)
   */
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const index = emblaApi.selectedScrollSnap();

    if (index !== selectedIndex) {
      setSelectedIndex(index);

      // Update URL to match the swiped-to slide
      const slide = slides[index];
      router.replace(slide.path);
      localStorage.setItem(LAST_PAGE_KEY, index.toString());
    }
  }, [emblaApi, selectedIndex, slides, router]);

  /**
   * On mount, and when the API is ready, initialize or re-initialize Embla.
   * This is the CORE of the fix: it ensures that we re-measure the container
   * *before* we try to scroll to a specific slide. This prevents a race condition
   * where Embla doesn't know the correct snap points yet.
   */
  useEffect(() => {
    if (!emblaApi) return;

    const initialize = () => {
      // Re-measure the container dimensions
      emblaApi.reInit();

      // Determine the correct starting slide index
      const urlIndex = getIndexFromPath(pathname);
      let startIndex = urlIndex;
      if (pathname === '/' || pathname === slides[defaultIndex].path) {
        const savedIndex = localStorage.getItem(LAST_PAGE_KEY);
        if (savedIndex !== null) {
          startIndex = parseInt(savedIndex, 10);
        }
      }
      
      // Set state and scroll to the initial slide without animation
      setSelectedIndex(startIndex);
      emblaApi.scrollTo(startIndex, true);
    };

    // Re-init after a tick to let the browser layout settle.
    const timeout = setTimeout(initialize, 100);

    return () => clearTimeout(timeout);
    // This effect should ONLY run when the emblaApi is first available.
    // All other logic is handled by other effects (onSelect, pathname changes).
  }, [emblaApi, getIndexFromPath, pathname, slides, defaultIndex]);

  /**
   * Initialize Embla event listeners
   */
  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  /**
   * Sync carousel position when URL changes externally (e.g., sidebar navigation)
   */
  useEffect(() => {
    const newIndex = getIndexFromPath(pathname);
    if (newIndex !== selectedIndex && emblaApi) {
      setSelectedIndex(newIndex);
      emblaApi.scrollTo(newIndex);
    }
    // Intentionally excluding selectedIndex to avoid re-running when it's set internally
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, getIndexFromPath, emblaApi]);

  /**
   * Keyboard navigation: Left/Right arrow keys
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && selectedIndex > 0) {
        navigateToSlide(selectedIndex - 1);
      } else if (e.key === 'ArrowRight' && selectedIndex < slides.length - 1) {
        navigateToSlide(selectedIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, navigateToSlide, slides.length]);

  return (
    <div className="flex flex-col h-screen">
      {/* Page Indicators */}
      <div className="flex justify-center items-center gap-2 py-3 bg-white border-b border-gray-200">
        {slides.map((slide, index) => (
          <button
            key={slide.path}
            onClick={() => navigateToSlide(index)}
            className={`transition-all ${
              selectedIndex === index
                ? 'px-4 py-1.5 bg-purple-600 text-white rounded-full text-sm font-medium'
                : 'px-3 py-1 text-gray-600 hover:text-purple-600 text-sm'
            }`}
            aria-label={`Navigate to ${slide.label}`}
            aria-current={selectedIndex === index ? 'page' : undefined}
          >
            {slide.label}
          </button>
        ))}
      </div>

      {/* Swipeable Container - viewport */}
      <div
        ref={emblaRef}
        style={{
          overflow: 'hidden',
          flex: 1,
          touchAction: 'pan-y'
        }}
      >
        {/* Container - direct child of viewport, must be flex */}
        <div style={{ display: 'flex', height: '100%', touchAction: 'pan-y' }}>
          {/* Wrap slides in context to signal they're inside SwipeContainer */}
          <SwipeContext.Provider value={{ insideSwipe: true }}>
            {slides.map((slide) => (
              <div
                key={slide.path}
                style={{
                  flex: '0 0 100%',
                  minWidth: 0,
                  height: '100%'
                }}
                className="overflow-y-auto"
              >
                {slide.content}
              </div>
            ))}
          </SwipeContext.Provider>
        </div>
      </div>
    </div>
  );
}
