// Google Analytics utility functions
declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
  }
}

// Analytics Events
export const trackEvent = (action: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, parameters);
  }
};

// Get measurement ID from environment
const GA_MEASUREMENT_ID = (import.meta as any).env?.VITE_FIREBASE_MEASUREMENT_ID?.replace(/['"]/g, '') || 'G-QDXM5DS2TH';

// Page view tracking
export const trackPageView = (page_title: string, page_location?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_title,
      page_location: page_location || window.location.href,
    });
  }
};

// User authentication events
export const trackUserLogin = (method: string) => {
  trackEvent('login', {
    method,
    event_category: 'authentication',
  });
};

export const trackUserSignup = (method: string) => {
  trackEvent('sign_up', {
    method,
    event_category: 'authentication',
  });
};

export const trackUserLogout = () => {
  trackEvent('logout', {
    event_category: 'authentication',
  });
};

// Course interaction events
export const trackCourseView = (courseId: string, courseName: string) => {
  trackEvent('view_item', {
    item_id: courseId,
    item_name: courseName,
    item_category: 'course',
    event_category: 'course_interaction',
  });
};

export const trackCourseEnrollment = (courseId: string, courseName: string, coursePrice: number) => {
  trackEvent('purchase', {
    transaction_id: `enrollment_${courseId}_${Date.now()}`,
    value: coursePrice,
    currency: 'INR',
    items: [{
      item_id: courseId,
      item_name: courseName,
      item_category: 'course',
      quantity: 1,
      price: coursePrice,
    }],
    event_category: 'ecommerce',
  });
};

export const trackCourseProgress = (courseId: string, courseName: string, progressPercentage: number) => {
  trackEvent('course_progress', {
    item_id: courseId,
    item_name: courseName,
    progress_percentage: progressPercentage,
    event_category: 'course_interaction',
  });
};

// Booking and scheduling events
export const trackSlotBooking = (instructorName: string, date: string, timeSlot: string) => {
  trackEvent('schedule_appointment', {
    instructor_name: instructorName,
    appointment_date: date,
    time_slot: timeSlot,
    event_category: 'booking',
  });
};

// Search and navigation events
export const trackSearch = (searchTerm: string, resultsCount: number) => {
  trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount,
    event_category: 'search',
  });
};

export const trackNavigation = (fromPage: string, toPage: string) => {
  trackEvent('page_navigation', {
    from_page: fromPage,
    to_page: toPage,
    event_category: 'navigation',
  });
};

// Payment events
export const trackPaymentInitiated = (courseId: string, amount: number, currency: string = 'INR') => {
  trackEvent('begin_checkout', {
    value: amount,
    currency,
    items: [{
      item_id: courseId,
      quantity: 1,
      price: amount,
    }],
    event_category: 'ecommerce',
  });
};

export const trackPaymentCompleted = (transactionId: string, courseId: string, amount: number, currency: string = 'INR') => {
  trackEvent('purchase', {
    transaction_id: transactionId,
    value: amount,
    currency,
    items: [{
      item_id: courseId,
      quantity: 1,
      price: amount,
    }],
    event_category: 'ecommerce',
  });
};

export const trackPaymentFailed = (courseId: string, amount: number, errorReason?: string) => {
  trackEvent('payment_failed', {
    item_id: courseId,
    value: amount,
    currency: 'INR',
    error_reason: errorReason,
    event_category: 'ecommerce',
  });
};

// User engagement events
export const trackVideoPlayback = (videoId: string, videoTitle: string, playbackTime: number) => {
  trackEvent('video_play', {
    video_id: videoId,
    video_title: videoTitle,
    playback_time: playbackTime,
    event_category: 'video_engagement',
  });
};

export const trackDownload = (fileName: string, fileType: string) => {
  trackEvent('file_download', {
    file_name: fileName,
    file_type: fileType,
    event_category: 'downloads',
  });
};

export const trackContactForm = (formType: string) => {
  trackEvent('contact_form_submit', {
    form_type: formType,
    event_category: 'contact',
  });
};

// Error tracking
export const trackError = (errorMessage: string, errorStack?: string, errorBoundary?: string) => {
  trackEvent('exception', {
    description: errorMessage,
    stack_trace: errorStack,
    error_boundary: errorBoundary,
    fatal: false,
    event_category: 'errors',
  });
};

// Feature usage tracking
export const trackFeatureUsage = (featureName: string, action: string, value?: number) => {
  trackEvent('feature_usage', {
    feature_name: featureName,
    action,
    value,
    event_category: 'features',
  });
};