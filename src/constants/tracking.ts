/**
 * Single source of truth for conversion events.
 * Components reference events by name (data-track="Lead"); lib/track.ts maps them to Meta Pixel + GA4.
 */
export const TRACK_EVENTS = {
  Lead: { meta: { method: 'track', name: 'Lead' }, ga4: 'generate_lead' },
  ScheduleCallClick: { meta: { method: 'trackCustom', name: 'ScheduleCallClick' }, ga4: 'schedule_call_click' },
  QuizClick: { meta: { method: 'trackCustom', name: 'QuizClick' }, ga4: 'quiz_click' },
  QuizComplete: { meta: { method: 'trackCustom', name: 'QuizComplete' }, ga4: 'quiz_complete' },
} as const satisfies Record<string, { meta: { method: 'track' | 'trackCustom'; name: string }; ga4: string }>;

export type TrackEvent = keyof typeof TRACK_EVENTS;

export const isTrackEvent = (value: string | null | undefined): value is TrackEvent =>
  !!value && Object.prototype.hasOwnProperty.call(TRACK_EVENTS, value);
