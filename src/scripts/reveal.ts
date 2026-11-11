/**
 * Scroll reveal. Elements with [data-reveal] fade/slide in once when they enter the viewport.
 * Optional [data-reveal-delay="150"] staggers siblings. Content is only hidden when JS runs (.js on <html>).
 */
export function initReveal(): void {
  const elements = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!elements.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) {
    elements.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        const delay = Number(el.dataset.revealDelay);
        if (delay > 0) el.style.setProperty('--reveal-delay', `${delay}ms`);
        el.classList.add('is-revealed');
        observer.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
  );

  elements.forEach((el) => observer.observe(el));
}
