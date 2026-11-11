# Alba Real Estate Group — Engineering Rules

Stack: **Astro 5 · Tailwind CSS v4 · TypeScript (strict) · Netlify (Forms + Functions) · Decap CMS**

Build this like a senior engineer who will hand the codebase to another developer for years.
Every page is a static, mobile-first, conversion-focused page receiving Meta ads traffic:
**speed, trust and compliance come before decoration.**

---

## 1. Project structure

```text
src/
├── pages/                 # Routes only. Thin: compose layout + page component.
├── layouts/               # BaseLayout (site), LandingLayout (ads pages)
├── components/
│   ├── ui/                # Generic, brand-agnostic: Button, Container, Section, Heading, Card, Badge, Icon, Field, Checkbox
│   ├── layout/            # Header, Footer, Brand, Seo, Analytics
│   ├── shared/            # Business sections reused across pages: LeadForm, TrustBar, ComplianceNotice, CtaBand
│   └── pages/             # Page-specific sections
│       └── <PageName>/
│           ├── Hero.astro
│           └── <PageName>.astro
├── lib/                   # Pure helpers + integrations (tracking, forms, cn)
├── scripts/               # Client-side TypeScript bundled by Astro (reveal, header, nav, forms)
├── types/                 # Shared TypeScript types
├── constants/             # Static config: navigation, tracking event map, routes
├── data/                  # Editable content (JSON). Decap CMS writes here.
├── assets/                # Images processed by astro:assets
└── styles/global.css      # Tailwind import + design tokens + typography + motion
public/                    # Served as-is: favicon, robots.txt, og image, guide PDFs, /admin
netlify/functions/         # Serverless functions (guide email)
```

Create a folder only when it holds something. No empty scaffolding.

## 2. Component architecture

```text
Page (src/pages/*.astro)
 └── Layout
      └── PageComponent (components/pages/X/X.astro)
           ├── Section → sub-components → ui/*
           └── Section
```

- Every meaningful section is its own component.
- Extract to `ui/` only when genuinely reusable and brand-agnostic.
- Extract to `shared/` when it is reused business UI (lead form, trust bar, CTA band).
- No components for trivial one-line markup.
- Content (copy, links, license numbers) lives in `src/data/*.json` or props, **never hardcoded deep inside components**, so the client can edit it from the admin panel.

## 3. Design tokens (Tailwind v4, CSS-first)

There is **no `tailwind.config.ts`**. Tailwind v4 is configured in `src/styles/global.css`:

- `@theme` is the **single source of truth** for colors, fonts, radii, shadows, easing. Every token becomes both a CSS variable and a utility (`--color-primary` → `bg-primary`, `text-primary`).
- Brand scale (`olive-*`, `gold-*`, `cream-*`) is defined once; **semantic tokens** (`background`, `foreground`, `primary`, `accent`, `muted`, `border`, `surface`) reference it.
- Components use **semantic tokens** (`bg-primary`, `text-muted-foreground`, `border-border`), not brand scale, so a rebrand is a token change.
- Never duplicate a token. Never redefine a value already in `@theme`.

## 4. Typography

Centralised as semantic utilities in `global.css` (`@utility`):

`text-display`, `text-h1`, `text-h2`, `text-h3`, `text-lead`, `text-body`, `text-small`, `text-caption`, `text-eyebrow`

Each sets family, fluid size (`clamp`), weight, line-height, letter-spacing and color.
Use `<Heading>` for headings (it maps `level` + `size` independently, so SEO structure and visual size are decoupled).
Do not write raw `text-[34px]`, `leading-[1.1]` or font stacks inside components.

## 5. Colors & visual styling

- No hex values, `rgb()` or inline `style=` in components. Use tokens/utilities.
- Same rule for backgrounds, borders, shadows, gradients, hover, focus and active states.
- Focus states are always visible (`focus-visible:` ring using `--color-ring`).
- Text contrast must meet WCAG AA (4.5:1 body, 3:1 large text). Gold on cream uses `gold-700`, never `gold-500`.

## 6. Motion

Smooth, calm, premium. Motion supports trust; it never delays the form.

- All timing comes from tokens: `--ease-out-expo`, `--duration-*`.
- Scroll reveals use `data-reveal` (`fade-up` | `fade` | `scale` | `slide-left` | `slide-right`) and optional `data-reveal-delay` (ms). One IntersectionObserver in `scripts/reveal.ts`.
- Animate only `transform` and `opacity` (GPU-friendly). Never animate layout properties.
- **Above-the-fold content and the lead form are never hidden waiting for JS.** Hero animations use CSS keyframes that start immediately.
- `prefers-reduced-motion: reduce` disables all motion globally.
- Without JS, everything is visible (`.js` class gates hidden states).

## 7. Astro best practices

- Zero client JS by default. Add a `<script>` only for real interactivity (nav, reveal, forms, quiz).
- Client scripts are TypeScript in `src/scripts/`, imported via `<script>` so Astro bundles, hashes and dedupes them.
- Images: always `astro:assets` `<Image>` / `<Picture>` with explicit `width`, `height`, `alt`; `loading="eager"` + `fetchpriority="high"` only for the LCP image.
- Fonts are self-hosted via Fontsource (no Google Fonts request on the critical path).
- Internal links are plain `<a>` with trailing slash (`/about/`).
- Pages stay small: route file = layout + page component + SEO props.
- Every page passes `title` and `description` to the layout. Thank-you, styleguide and admin pages are `noindex` and excluded from the sitemap.

## 8. TypeScript

- `astro/tsconfigs/strict`. No `any`.
- Every component declares `interface Props`.
- Shared shapes (`SiteSettings`, `NavItem`, `TrackEvent`, `Guide`) live in `src/types/`.
- Prefer union literal types for variants (`'primary' | 'outline'`) and discriminated unions for state.
- Data files are typed at the import boundary (`satisfies` / typed loader in `lib/`).

## 9. Forms, tracking & compliance (non-negotiable)

- All forms: Netlify Forms (`data-netlify="true"`), honeypot field, consent checkbox (required), link to `/privacy-policy/`.
- Inputs: correct `type`, `autocomplete`, `inputmode`, 16px+ font (prevents iOS zoom), visible labels.
- Conversion events are fired only through `lib/track.ts` and declared in `constants/tracking.ts`:
  `Lead`, `ScheduleCallClick`, `QuizClick`, `QuizComplete`.
- Use `data-track="<Event>"` on links/buttons; never call `fbq`/`gtag` directly from components.
- Every page footer shows: Individual NMLS, Company NMLS (Loan Advisor Group), CO License, Equal Housing Opportunity, and "Powered by Loan Advisor Group". These values come from `src/data/site.json`.

## 10. Performance budget (per landing page, mobile)

- Lighthouse Performance ≥ 95, Accessibility ≥ 95, SEO 100.
- LCP < 2.0s on 4G, CLS < 0.05.
- Client JS < 15 KB gzipped (excluding Meta Pixel / GA4).
- No layout shift from fonts or images (explicit dimensions, `font-display: swap`).

## 11. Final quality check (before every delivery)

- [ ] Visually checked at 375px, 768px and 1280px.
- [ ] No inline styles, no hardcoded colors, typography only via semantic utilities.
- [ ] No duplicate tokens; `@theme` is the only source.
- [ ] Components separated; reusable components actually reused.
- [ ] `npm run check` (astro check) passes with zero errors.
- [ ] `npm run build` passes.
- [ ] Keyboard navigation and focus states work; images have alt text.
- [ ] Reduced-motion and no-JS states show all content.
- [ ] Forms submit, honeypot blocks bots, consent is required, events fire (`window.ALBA_DEBUG = true`).
- [ ] No unnecessary dependencies or abstractions introduced.
