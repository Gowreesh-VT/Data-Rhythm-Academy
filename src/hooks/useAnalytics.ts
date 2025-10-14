import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../lib/analytics';

// Custom hook for automatic page view tracking
export const useAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view on route change
    const pageTitle = document.title || 'Data Rhythm Academy';
    trackPageView(pageTitle, window.location.href);
  }, [location]);

  return null;
};

// Hook for tracking user sessions
export const useSessionTracking = () => {
  useEffect(() => {
    // Track session start
    const sessionStart = Date.now();
    
    // Track session duration on page unload
    const handleBeforeUnload = () => {
      const sessionDuration = Date.now() - sessionStart;
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'session_duration', {
          duration: sessionDuration,
          event_category: 'engagement',
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
};