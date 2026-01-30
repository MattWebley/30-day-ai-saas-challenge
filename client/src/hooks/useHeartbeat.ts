import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

/**
 * Sends a heartbeat to the server every 30 seconds while user is active.
 * This is used for live user tracking in the admin panel.
 * - No database writes (in-memory only)
 * - Lightweight POST request
 * - Only runs when user is authenticated
 */
export function useHeartbeat(isAuthenticated: boolean) {
  const [location] = useLocation();
  const lastPageRef = useRef<string>('');

  useEffect(() => {
    if (!isAuthenticated) return;

    // Determine the current page name
    const getPageName = () => {
      if (location === '/') return 'landing';
      if (location === '/dashboard') return 'dashboard';
      if (location === '/admin') return 'admin';
      if (location === '/settings') return 'settings';
      if (location === '/showcase') return 'showcase';
      if (location === '/coaching') return 'coaching';
      if (location === '/progress') return 'my-progress';
      if (location.startsWith('/order')) return 'order';
      return location.replace(/^\//, '') || 'unknown';
    };

    const sendHeartbeat = async () => {
      const page = getPageName();
      try {
        await fetch('/api/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ page }),
        });
      } catch {
        // Silently fail - this is non-critical
      }
    };

    // Send immediately on page change
    const currentPage = getPageName();
    if (currentPage !== lastPageRef.current) {
      lastPageRef.current = currentPage;
      sendHeartbeat();
    }

    // Then send every 30 seconds
    const interval = setInterval(sendHeartbeat, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, location]);
}
