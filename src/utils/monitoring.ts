// Error monitoring and analytics
interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  userAgent: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

interface AnalyticsEvent {
  event: string;
  category: string;
  label?: string;
  value?: number;
  userId?: string;
  timestamp: number;
  properties?: Record<string, any>;
}

class ErrorMonitoring {
  private sessionId: string;
  private userId?: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandlers();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandlers(): void {
    // Catch JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        stack: event.error?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        userId: this.userId,
        sessionId: this.sessionId
      });
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        userId: this.userId,
        sessionId: this.sessionId
      });
    });
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  logError(errorInfo: ErrorInfo): void {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorInfo);
    }

    // Send to error monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendErrorToService(errorInfo);
    }
  }

  private async sendErrorToService(errorInfo: ErrorInfo): Promise<void> {
    try {
      // Replace with your error monitoring service (Sentry, LogRocket, etc.)
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorInfo),
      });
    } catch (error) {
      console.error('Failed to send error to monitoring service:', error);
    }
  }
}

class Analytics {
  private userId?: string;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    // Initialize analytics service (Google Analytics, Mixpanel, etc.)
    if (typeof window !== 'undefined') {
      this.isInitialized = true;
    }
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  track(event: string, properties?: Record<string, any>): void {
    if (!this.isInitialized) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      category: 'user_action',
      userId: this.userId,
      timestamp: Date.now(),
      properties
    };

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics event:', analyticsEvent);
    }

    // Send to analytics service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendAnalyticsEvent(analyticsEvent);
    }
  }

  page(path: string, title?: string): void {
    this.track('page_view', {
      path,
      title: title || document.title,
      referrer: document.referrer
    });
  }

  courseEvent(action: string, courseId: string, properties?: Record<string, any>): void {
    this.track(`course_${action}`, {
      courseId,
      ...properties
    });
  }

  enrollmentEvent(courseId: string, price: number): void {
    this.track('course_enrollment', {
      courseId,
      price,
      currency: 'USD'
    });
  }

  lessonEvent(action: string, courseId: string, lessonId: string): void {
    this.track(`lesson_${action}`, {
      courseId,
      lessonId
    });
  }

  private async sendAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
    try {
      // Replace with your analytics service endpoint
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }
}

// Performance monitoring
class PerformanceMonitoring {
  static measurePageLoad(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const metrics = {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        domInteractive: navigation.domInteractive - navigation.domContentLoadedEventStart,
        firstByte: navigation.responseStart - navigation.requestStart,
        pageLoad: navigation.loadEventEnd - navigation.fetchStart,
      };

      analytics.track('page_performance', metrics);
    });
  }

  static measureUserTiming(name: string, startTime: number): void {
    const duration = window.performance.now() - startTime;
    analytics.track('user_timing', {
      name,
      duration
    });
  }
}

// Initialize services
export const errorMonitoring = new ErrorMonitoring();
export const analytics = new Analytics();
export const performance = PerformanceMonitoring;

// Utility hooks
export const useErrorMonitoring = () => ({
  logError: (error: Error, errorInfo?: any) => {
    errorMonitoring.logError({
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      sessionId: errorMonitoring['sessionId']
    });
  }
});

export const useAnalytics = () => ({
  track: analytics.track.bind(analytics),
  page: analytics.page.bind(analytics),
  courseEvent: analytics.courseEvent.bind(analytics),
  enrollmentEvent: analytics.enrollmentEvent.bind(analytics),
  lessonEvent: analytics.lessonEvent.bind(analytics)
});