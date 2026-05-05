// GA4 custom event helper
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export const trackEvent = (eventName: string, params?: Record<string, string | number | boolean>) => {
  if (window.gtag) {
    window.gtag('event', eventName, params);
  }
};

// Predefined events
export const trackLessonStart = (category: string) =>
  trackEvent('lesson_start', { category });

export const trackPracticeStart = (type: string) =>
  trackEvent('practice_start', { practice_type: type });

export const trackHandStart = (handNumber?: number) =>
  trackEvent('hand_start', { hand_number: handNumber ?? 1 });

export const trackHandResult = (result: 'win' | 'loss' | 'tie', pot: number) =>
  trackEvent('hand_result', { result, pot });

export const trackSave = (context: string) =>
  trackEvent('save_click', { context });

export const trackShare = (context: string) =>
  trackEvent('share_click', { context });
