import type { NavItem } from '@/types/site';

export const ROUTES = {
  home: '/',
  about: '/about/',
  services: '/services/',
  contact: '/contact/',
  privacy: '/privacy-policy/',
  terms: '/terms-of-use/',
  quiz: '/quiz/',
  firstTimeGuide: '/first-time-homebuyer-guide/',
  selfEmployedGuide: '/self-employed-borrower-guide/',
} as const;

export const MAIN_NAV: readonly NavItem[] = [
  { label: 'Home', href: ROUTES.home },
  { label: 'About', href: ROUTES.about },
  { label: 'Services', href: ROUTES.services },
  { label: 'Contact', href: ROUTES.contact },
];

export const GUIDE_NAV: readonly NavItem[] = [
  { label: 'First-time buyer guide', href: ROUTES.firstTimeGuide },
  { label: 'Self-employed borrower guide', href: ROUTES.selfEmployedGuide },
  { label: 'Purchase & refinance quiz', href: ROUTES.quiz },
];
