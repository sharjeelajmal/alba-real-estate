# Alba Real Estate Group

Mortgage lead-gen website and Meta ads landing pages for Alba Real Estate Group (powered by Loan Advisor Group).

**Stack:** Astro 5 · Tailwind CSS v4 · TypeScript (strict) · Netlify Forms + Functions · Decap CMS · Meta Pixel + GA4

Read [`RULES.md`](./RULES.md) before contributing. It defines structure, tokens, typography, motion and the quality checklist.

## Getting started

```bash
npm install
npm run dev      # http://localhost:4321
npm run check    # type-check (astro check)
npm run build    # check + production build to dist/
```

## Where things live

| What | Where |
|---|---|
| Business info, licenses, links, tracking IDs | `src/data/site.json` |
| Design tokens, typography, motion | `src/styles/global.css` |
| Navigation + routes | `src/constants/navigation.ts` |
| Conversion events | `src/constants/tracking.ts` → `src/lib/track.ts` |
| Reusable UI | `src/components/ui/` |
| Header, footer, SEO, analytics | `src/components/layout/` |
| Page sections | `src/components/pages/<Page>/` |
| Client scripts | `src/scripts/` |

Internal design reference: `/styleguide/` (noindex).

## Conversion events

Add `track="Lead"` to a `<Button>` or `data-track="Lead"` to any element.

| Event | Meta Pixel | GA4 |
|---|---|---|
| `Lead` | `Lead` | `generate_lead` |
| `ScheduleCallClick` | `ScheduleCallClick` (custom) | `schedule_call_click` |
| `QuizClick` | `QuizClick` (custom) | `quiz_click` |
| `QuizComplete` | `QuizComplete` (custom) | `quiz_complete` |

Debug in the browser console: `window.ALBA_DEBUG = true`.

## Motion

Add `data-reveal="fade-up"` (or `fade`, `scale`, `slide-left`, `slide-right`) and optional `data-reveal-delay="120"` to any element. Above-the-fold content uses `animate-enter animation-delay-100`. Reduced-motion users see no animation.
