import { isTrackEvent } from '@/constants/tracking';
import { track } from '@/lib/track';
import { confirmLead, initForms } from './forms';
import { initHeader } from './header';
import { initReveal } from './reveal';

/** Any element with data-track="<Event>" fires that conversion event on click. */
function initClickTracking(): void {
  document.addEventListener('click', (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-track]');
    if (!el) return;
    const event = el.dataset.track;
    if (!isTrackEvent(event)) return;
    track(event, {
      content_name: el.dataset.trackLabel ?? el.textContent?.trim().slice(0, 60),
    });
  });
}

initHeader();
initReveal();
initClickTracking();
initForms();
// Wait for the pixel/gtag queue to exist before confirming the lead
if (document.readyState === 'complete') confirmLead();
else window.addEventListener('load', confirmLead, { once: true });
