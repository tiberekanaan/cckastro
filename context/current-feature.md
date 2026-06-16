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

#### Commissioner Profiles (added — branch `feature/commissioner-profiles`)
- Backend: new `commissioner` collection (name, role, slug UID→name, image, background richtext) + `blocks.commissioner-profiles` component (oneToMany relation `commissioners`); registered in `page.content`.
- Frontend: `CommissionerProfiles.astro` card grid (links to `/commissioners/[slug]`), wired in `BlockRenderer.astro`; `about.astro` appends nested relation→media populate.
- Detail route `commissioners/[slug].astro` (SSR, slug filter, RichText background, back-to-About link); `Commissioner` + block types added.
- `astro check` + `npm run build` pass clean. Strapi schema sync requires `yarn develop` restart. Awaiting commit approval.

#### Resources Library (added — branch `feature/resources-library`)
- Backend: new `official-document` collection (`title` string, `type` enum Regulation/Rule, `file` single PDF media) + router/controller/service factories. Overlaps legacy `resource` collection (kept separate per spec).
- Nav: removed redundant `Regulation`→`/regulation`; `Resources`→`/resources` is now the sole link. Added `OfficialDocument` + `StrapiPagination` types.
- Frontend: new SSR `resources/index.astro` (`prerender=false`) — GET filter form (q/type/limit), Strapi `filters[title][$containsi]` + `filters[type][$eq]` + `pagination[page|pageSize]` fetch, 4-col card grid, type-differentiated SVG headers, astro-icon View/Download buttons, Prev/Next from `meta.pagination`.
- `astro check` + `npm run build` pass clean. Strapi schema sync requires `yarn develop` restart. Awaiting commit approval + browser review.

#### Universal Access Fund (added — branch `feature/uaf-page`)
- Backend: new `uaf-page` **single type** (`title` string, `description` richtext/Markdown) + router/controller/service factories.
- Nav: `site.ts` main nav `Public Consultations`→`/consultations` replaced with `UAF`→`/universal-access` (Header + Footer both read `site.ts`; footer Resources-column consultations link left intact).
- Frontend: new SSR `universal-access.astro` (`prerender=false`) — parallel native fetch of `/api/uaf-page` + `/api/projects?populate=photos`; h1 + `marked`-rendered Markdown in arbitrary-variant prose container; reveal-staggered (`data-reveal` + inline `animation-delay`) card grid linking to `/projects/[documentId]`.
- New SSR `projects/[documentId].astro` detail route (cover + RichTextNode body + photo gallery, back-to-UAF link). `Project` + `UafPage` types added.
- Adaptations vs spec: no Astro `projects` Content collection (used SSR fetch like News, not `getCollection`); `project` schema has no `slug`/`image`/`project_status` (link by `documentId`, image from `photos[0]`, status pill omitted); no typography plugin (arbitrary-variant prose, not `prose`).
- `astro check` + `npm run build` pass clean. Strapi schema sync requires `yarn develop` restart + publishing the single type. Awaiting commit approval + browser review.

#### History
