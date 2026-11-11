import { TRACK_EVENTS, type TrackEvent } from '@/constants/tracking';

type TrackParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    fbq?: (method: string, name: string, params?: TrackParams) => void;
    gtag?: (command: 'event', name: string, params?: TrackParams) => void;
    ALBA_DEBUG?: boolean;
  }
}

/**
 * Fire a conversion event on Meta Pixel and GA4.
 * Safe to call when either tag is missing (IDs not configured yet, blocked by an ad blocker).
 */
export function track(event: TrackEvent, params: TrackParams = {}): void {
  const config = TRACK_EVENTS[event];
  const payload: TrackParams = { page_path: window.location.pathname, ...params };

  try {
    window.fbq?.(config.meta.method, config.meta.name, payload);
  } catch {
    /* never let analytics break the page */
  }
  try {
    window.gtag?.('event', config.ga4, payload);
  } catch {
    /* never let analytics break the page */
  }

  if (window.ALBA_DEBUG) console.info('[track]', event, payload);
}
