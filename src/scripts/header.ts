/** Header: elevated state on scroll + accessible mobile navigation. */
export function initHeader(): void {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;

  // Elevated state once the page scrolls (rAF-throttled, passive listener)
  let ticking = false;
  const updateScrolled = () => {
    header.dataset.scrolled = String(window.scrollY > 8);
    ticking = false;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateScrolled);
      }
    },
    { passive: true },
  );
  updateScrolled();

  // Mobile navigation
  const toggle = header.querySelector<HTMLButtonElement>('[data-nav-toggle]');
  const panel = document.getElementById('mobile-nav');
  if (!toggle || !panel) return;

  const setOpen = (open: boolean) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    panel.dataset.open = String(open);
    panel.toggleAttribute('inert', !open);
    document.documentElement.classList.toggle('overflow-hidden', open);
    if (open) panel.querySelector<HTMLElement>('a')?.focus({ preventScroll: true });
  };

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  panel.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.dataset.open === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
  window.matchMedia('(min-width: 64rem)').addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });
}
