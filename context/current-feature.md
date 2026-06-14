#### Current Feature

**Feature:** CCK Landing Page rebuild (Astro 6 frontend)

#### Status
Built — branch `feature/landing-page`. `npm run build` passes. Awaiting commit approval + browser review.

#### Goals
- Rebuild the CCK telecom-regulator landing page in a new Astro 6 app at `frontend/`.
- Keep the professional navy/blue brand; improve overall UI/UX.
- Theming: semantic OKLCH tokens via `@theme` in `src/styles/global.css` (Tailwind v4, no JS config).
- Zero-JS `.astro` components in `src/components/{layout,home,ui}`.
- Typed, Zod-validated content layer (Content Loader API + local JSON mock), swap-ready for Strapi 5.
- Full page: Header, Hero, Our Services, Market Insight, Latest Updates, Distress Beacon CTA, Help CTA, Footer.

#### Strapi Dynamic Zone Wiring (added)
- Backend: new `blocks.hero`, `blocks.services-grid`, `blocks.cta` components + `shared.service-item`; all registered in `page.content` dynamic zone.
- Frontend: `index.astro` now SSR (`prerender = false`), native `fetch` to `/api/pages` with per-block deep populate (`populate[content][on][...]`), `__component` switch via `BlockRenderer.astro` → `src/components/blocks/*`.
- Latest Updates now fetches latest 3 from News collection (`/api/news?sort=date:desc&limit=3`) via `LatestNews.astro` (not a dynamic-zone block).
- Added `@astrojs/node` (standalone) adapter for SSR; `npm run build` + `astro check` pass clean.

#### History
