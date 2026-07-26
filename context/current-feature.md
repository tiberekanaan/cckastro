#### Current Feature

**Feature:** _None in progress — next feature TBD._

#### Social share previews (Open Graph / Twitter cards) (merged to `main`, pushed, branch deleted) — ✅ Completed

- Problem: sharing cck.ki on social media showed a blank gray card with title "CCK Homepage | CCK" — the site had zero Open Graph/Twitter meta tags, so scrapers had nothing to work with.
- Frontend-only. `BaseLayout.astro` `<head>` gains canonical link + full OG/Twitter set: `og:type/site_name/title/description/url/image(+width/height/alt)` and `twitter:card=summary_large_image/title/description/image`. Absolute URLs built against `Astro.site`; `astro.config.mjs` `site` fixed from stale `https://cck.gov.ki` → `https://cck.ki`.
- New props `ogTitle`/`ogDescription` (default to `title`/`description`) + `ogImage` (default `/og-image.jpg`) — homepage passes ogTitle "Communications Commission of Kiribati" + a proper regulator blurb, since the CMS Page entry's title/description are "Home"/"Home page". `og:image:width/height` hints emitted only for the bundled default image.
- New `public/og-image.jpg` (1200×630, 128KB): CCK headquarters + radio tower photo (from live `/media/1743048724744_2_2a7a0986ec.jpg`) with navy gradient, CCK logo, "Communications Commission of Kiribati" text, green brand bar. Generated via sharp (script kept in session scratchpad only).
- Any page can later pass its own `ogImage` (e.g. news article photos) — not wired yet, default card serves site-wide.
- Verified via dev server: `/` renders full tag set with absolute `https://cck.ki/...` URLs + override title/description; `/contact` inherits defaults with correct per-page `og:url`; `/og-image.jpg` → 200 `image/jpeg`. `astro check` (0 errors) + `npm run build` pass clean.
- Merged + pushed 2026-07-27 (`fa7535a`); Vercel auto-deploys.
- Post-deploy: re-scrape with Facebook Sharing Debugger (facebook.com/tools/debug) — FB caches the old empty card.
- ✅ `www.cck.ki` resolved 2026-07-27 (no code): Hostinger CNAME `www` → `cname.vercel-dns.com` + domain added to the Vercel `cckastro` project (`vercel domains add www.cck.ki cckastro`) with a dashboard-set 308 redirect to `cck.ki` (paths preserved, SSL auto-issued). Verified: `https://www.cck.ki/contact` → 308 → `https://cck.ki/contact` → 200. Vercel suggests a project-specific CNAME (`b52e9cbad3a6ec25.vercel-dns-017.com`) as rank 1, but `cname.vercel-dns.com` is a supported config — no change needed.

#### Proxy Strapi media through the frontend domain (merged to `main`, deployed, branch deleted) — ✅ Completed

- Problem: images (news photos, project galleries, hero/CTA images, CMS logo/favicon) load straight from `…media.strapiapp.com`, still exposing Strapi Cloud hosting after the `web.cck.ki` domain switch.
- Fix (frontend-only): new SSR catch-all `src/pages/media/[...path].ts` streams files from the media host (new `STRAPI_MEDIA_URL` env var) with upstream Content-Type, long immutable Cache-Control (media filenames are content-hashed), Range passthrough; path validated, unknown → 404, upstream failure → 502.
- `mediaUrl()` rewrites media-host URLs to `/media/<path>` when `STRAPI_MEDIA_URL` is set; new `upstreamMediaUrl()` keeps the raw URL for server-side fetches (`files/[documentId].ts`).
- Deploy-order safe: `STRAPI_MEDIA_URL` unset → passthrough (today's behavior). Vercel needs the new env var + redeploy.
- Media-host quirk: missing objects answer 403 (S3-style), mapped to 404 alongside real 404s.
- Verified via dev server against live Strapi Cloud: `/media/Kauma_5cc89d366f.webp` → 200 `image/webp` with `public, max-age=31536000, s-maxage=31536000, immutable`; Range request → 206; traversal (`/media/../…`) + unknown file → 404; home, `/news`, `/universal-access`, `/about`, `/resources` render zero `media.strapiapp` references — all img srcs are `/media/<file>`; `/files/<id>` proxy still streams PDFs (server-side fetch via new `upstreamMediaUrl()`). `astro check` (0 errors) + `npm run build` pass clean. Merged + pushed 2026-07-27 (`e0dc7a7`), branch deleted.
- Deploy hiccup: while adding `STRAPI_MEDIA_URL` in Vercel, `STRAPI_URL` got retyped as `web.ccki.ki` (extra `i`) → all runtime Strapi fetches ENOTFOUND (pages fell back to empty states, `/files` 502). Diagnosed via `vercel logs`; local repo (`frontend/`) is now `vercel link`ed, env vars are Sensitive (not readable via `env pull`). Fixed via CLI (`vercel env rm/add STRAPI_URL` production + preview → `https://web.cck.ki`) + `vercel redeploy`.
- Verified live on cck.ki post-redeploy 2026-07-27: `/media/<file>` → 200 `image/webp` immutable (Vercel edge caches via s-maxage); `/files/<id>` → 200 `application/pdf`; home/news/UAF/about/resources all render images from `/media/…` with zero `media.strapiapp` references; missing media → 404.
- Vercel env now: `STRAPI_URL=https://web.cck.ki` + `STRAPI_MEDIA_URL=https://brave-acoustics-674445e63c.media.strapiapp.com` (both Production + Preview). Backend-host exposure via media URLs is now closed; remaining discoverability is only DNS itself (`web.cck.ki` CNAME target is public by nature).

#### Custom backend domain web.cck.ki (committed to `main`, deployed) — ✅ Completed

- Strapi Cloud backend now served from `https://web.cck.ki` instead of the bare `brave-acoustics-674445e63c.strapiapp.com` URL (which still works alongside it — Strapi Cloud keeps both). Admin: `https://web.cck.ki/admin`.
- Setup (no code): domain added in Strapi Cloud → Settings → Domains; CNAME `web` → `brave-acoustics-674445e63c.strapiapp.com` added in Hostinger DNS for `cck.ki`; Strapi auto-issued SSL once the record propagated.
- Frontend: `frontend/.env` + Vercel `STRAPI_URL` env var → `https://web.cck.ki` (inlined at build time — required a redeploy); `astro.config.mjs` `image.remotePatterns` stale DigitalOcean host swapped for `web.cck.ki`. Backend CORS untouched (allowlists frontend origins only).
- Verified live post-redeploy 2026-07-27: `cck.ki` 200, `/contact` renders subject dropdown, `/files/iph2uxueuk2ctpapm868c40w` → 200 `application/pdf` (request-time fetch through the new domain). `astro check` (0 errors) + `npm run build` pass clean. Committed `83c3e69`.
- Still exposed: uploaded media serves from `…media.strapiapp.com` regardless of the custom domain (image URLs, e.g. the logo, reveal Strapi Cloud hosting) — proxying media would be a separate feature.

#### Proxy Resources file links through the frontend domain (merged to `main`, pushed, branch deleted) — ✅ Completed

- Problem: `/resources` View/Download links point straight at the Strapi Cloud media host (`…media.strapiapp.com/…`), exposing where the backend is hosted (and by extension its admin login URL).
- Fix (frontend-only): new SSR endpoint `src/pages/files/[documentId].ts` — looks up the Official Document via public `find` + `filters[documentId][$eq]` (no new permission), fetches the file server-side, streams it back with upstream `Content-Type` + `Content-Disposition` filename. Visitors only ever see `cck.ki/files/<id>`.
- `?download=1` sets `Content-Disposition: attachment` — also fixes the Download button, whose `download` attribute is silently ignored cross-origin today (it behaved like View).
- `resources/index.astro` swaps both hrefs to the proxy route. `documentId` in the URL is acceptable here — official-document has no slug/detail page; this is a file endpoint, not a content page.
- Out of scope: proxying images/other media (host still discoverable via image URLs elsewhere, e.g. the Global Settings logo on every page) — separate feature if wanted.
- Also: `name`/`ext`/`mime` optional fields added to `StrapiMedia`; filename sent via quoted ASCII + RFC 5987 `filename*`; 1h `Cache-Control`; bad/unknown documentId → 404; Strapi/media fetch failure → 502.
- Verified via dev server against live Strapi Cloud: `/files/iph2uxueuk2ctpapm868c40w` → 200 `application/pdf`, `inline; filename="Communications Licensing Rules 2014.pdf"`, body is a valid PDF; `?download=1` → `attachment`; malformed + unknown ids → 404; `/resources` cards render only `/files/<id>` hrefs (zero document links to strapiapp). `astro check` (0 errors) + `npm run build` pass clean. Merged + pushed 2026-07-27 (`bb887a2`); Vercel auto-deploys.

#### Prevent duplicate form submissions — contact + distress beacon (merged to `main`, pushed, branch deleted) — ✅ Completed

- Frontend-only. Rapid double-clicks on "Send Message" / "Submit Registration" POST the form multiple times → duplicate Strapi entries + duplicate notification emails.
- New shared `components/forms/PreventDoubleSubmit.astro`: document-delegated `submit` listener (survives ClientRouter swaps, Astro dedupes the module script) targeting `form[data-prevent-resubmit]` — first submit marks the form + disables the submit button and swaps its text to the button's `data-busy-label`; repeat submits are `preventDefault`ed.
- `contact.astro` + `distress-beacon.astro`: forms gain `data-prevent-resubmit`, buttons gain `disabled:` styling + busy labels ("Sending…" / "Submitting…"), pages include the component.
- bfcache guard: `pageshow` (persisted) re-arms guarded forms and restores the button's idle label so back-navigation never leaves a stuck disabled button.
- Verified in browser (dev server against local Strapi, user's `yarn develop` on 1337): contact form — two synchronous `requestSubmit()` calls created exactly ONE Contact Message row (4→5), button disabled + "Sending…", success banner rendered; beacon form — first submit event allowed, second `defaultPrevented`, button disabled + "Submitting…". Test row deleted from local DB. `astro check` (0 errors) + `npm run build` pass clean. Merged + pushed 2026-07-27 (`9eff27e`); Vercel auto-deploys.
- Note: guards accidental double-clicks only — an intentional re-submit after reload still creates a new entry (server-side dedup would be a separate feature).

#### Contact form subject dropdown + per-subject routing email (merged to `main`, pushed, branch deleted) — ✅ Completed

- Backend: new `contact-subject` collection (`label` string required, `recipientEmail` email required; `draftAndPublish:false`) — client manages the subject list + department routing in Content Manager (e.g. Licensing → licensing@cck.ki, Payment issues → account@cck.ki, General → info@cck.ki). Bootstrap grants Public `find`.
- Lifecycle: `contact-message` `afterCreate` looks up the recipient by submitted subject (case-insensitive label match via Document Service); no match / lookup failure → falls back to `info@cck.ki`. Acknowledgement email to submitter unchanged.
- Frontend: `contact.astro` subject text input → `<select>` populated from `/api/contact-subjects` (labels only via `fields`), with a built-in fallback list (General / Licensing / Payment issues) when Strapi is unreachable or the collection is empty. `ContactSubject` type added. Action validation unchanged (subject stays a required string).
- Deploy-order safe: cloud backend without the collection → frontend falls back to the static list; lifecycle falls back to `info@cck.ki`.
- Frontend dedupes labels (`Set`) as a guard; `label` is `unique:true` in the schema so Content Manager prevents duplicates anyway.
- Verified locally: schema synced via `yarn develop`; `/api/contact-subjects` 200 (public find), `$eqi` label filter matches case-insensitively ("licensing" → licensing@cck.ki row); POST contact message 201 with lifecycle lookup active; dev server against local Strapi renders the live dropdown, against Strapi Cloud renders the fallback list. Test rows deleted from local DB. `tsc --noEmit` (backend), `astro check` (0 errors) + `npm run build` pass clean.
- Merged + pushed 2026-07-26 (`dfde15b`); Strapi Cloud + Vercel auto-deploy.
- Content entered in Strapi Cloud → Contact Subject 2026-07-27 (via browser): General → info@cck.ki, Licensing → licensing@cck.ki, Payment issues → account@cck.ki. Verified live: cloud API returns all 3, cck.ki/contact renders the real dropdown (not the fallback). Client can add/edit subjects + recipients in Content Manager anytime.

#### Remove eyebrow labels site-wide (merged to `main`, pushed) — ✅ Completed

Frontend-only. Remove all small uppercase "eyebrow"/kicker labels above headings (e.g. "News & notices" over Latest Updates) across the site: `SectionHeading` eyebrow prop + markup (covers LatestNews, ServicesGrid, ServicesAccordion incl. CMS-fed `block.eyebrow`), CommissionerProfiles inline eyebrow, detail-page kickers ("Universal Access Fund" on projects, "Career Opportunity" on careers, "NEWS ·" prefix on news — article date kept, restyled muted). Section headings scaled up a step (`text-3xl sm:text-4xl` → `text-3xl sm:text-4xl lg:text-5xl`) so sections still carry weight. Functional uppercase labels (contact `<dt>`s, table headers, status pills, TOC "On this page", card dates) untouched. `components/home/*` is dead code — eyebrow props stripped there too so `astro check` stays clean. `MarketInsightsSection` h2 bumped to match the paired "Our service" heading. Detail-page h1s gain `sm:text-5xl`; news date kept as muted `<time>` under the title. Verified in browser (dev server against live Strapi Cloud): home (Our service / Market Insight / Latest News), commissioner profiles, news + project detail all clean. `astro check` (0 errors) + `npm run build` pass. Merged + pushed 2026-07-26 (`4fc21ea`); Vercel auto-deploys.

#### Service detail rich content — polished .ki Domains page (merged to `main`, deployed, branch deleted) — ✅ Completed

Restyled `/services/[slug]` to match the old-site .ki Domains reference: `content` richtext rendered as real Markdown (styled prose, serif navy headings, fee table with grouped rows, numbered process) with a "Frequently Asked Questions" section auto-rendered as a zero-JS `<details>` accordion. Frontend-only; all service pages benefit; plain-text legacy content still renders. Table rows animate on hover (accent tint + inset green bar + first-cell nudge; group rows static). Live-verified on cck.ki 2026-07-25.

- `services/[slug].astro`: `content` split on `## ` headings; FAQ-titled section with `### ` questions → `<details>`/`<summary>` accordion (first item open, navy closed / accent-tinted open headers, chevron rotate); other sections → marked-rendered prose (local `Marked` instance, `breaks: true` so legacy plain text keeps its line breaks). Tables wrapped in `.table-scroll` (overflow-x, rounded border) via string wrap; navy header row, group rows (`tr:has(td>strong:only-child)`) tinted, value columns nowrap navy. Debug `console.log` removed.
- Verified in browser (dev server against live Strapi Cloud, then on cck.ki post-deploy): headings + accent bars, fee table groups, numbered process, FAQ accordion toggle all match reference; legacy plain-text fallback renders cleanly. `astro check` (0 errors) + `npm run build` pass clean. Merged + pushed 2026-07-25 (`d240dca`); Vercel deploy confirmed live.
- Content: new Domain Name Markdown pasted + published in Strapi Cloud (Service → Domain Name → content) 2026-07-25 — took three tries: first paste landed in the unused Page collection "Domain" entry, second carried 72 stray "Drag" UI-artifact lines (fixed by re-copying from a plain-text file, `~/Desktop/domain-name-content.md`). Verified in browser against live cloud: full reference layout renders (fee table groups, steps, FAQ accordion). FAQ answers 2–5 drafted new — verify wording against the old site.
- Loose ends: FAQ answers 2–5 were AI-drafted (screenshot only showed answer 1) — client should confirm wording in Strapi; unused "Domain" entry in the Page collection + `~/Desktop/domain-name-content.md` can be deleted.

#### Status
Last completed: Service detail rich content (.ki Domains page, above). `feature/email-notifications` still awaiting commit approval (section below).

#### Footer logo restyle (merged to `main`, pushed, branch deleted) — ✅ Completed
- Frontend-only, `Footer.astro`: white circular chip removed; logo enlarged 36px → 176px (`h-44 w-44 object-contain`, `alt` = site short name) and now stands alone in the first column — CCK wordmark, siteName, and the address/email/phone block removed per user (matches reference screenshot; contact details remain on `/contact` + bottom bar copyright unchanged).
- Monochrome-until-hover (per user screenshot): `grayscale opacity-60` at rest so the coat of arms blends into the navy footer, `hover:grayscale-0 hover:opacity-100` with `transition-all duration-300` reveals full color.
- Verified in browser (dev server): large desaturated standalone logo on navy, hover restores full red/gold color. `astro check` (0 errors) + `npm run build` pass clean. Merged + pushed 2026-07-25; Vercel auto-deploys.

#### Editable footer logo / coat of arms (added — branch `feature/footer-logo`)
- Backend: `global-setting` single type gains `footerLogo` single-image media field (schema sync = `yarn develop` restart + republish).
- Frontend: `footerLogoUrl` threaded through `GlobalSetting`/`GlobalSettings` + `getGlobalSettings()`; populate switched from explicit key list to `populate=*` so the fetch stays valid against a cloud backend that predates `footerLogo` (explicit unknown key would 400 → all Global Settings would fall back). `Footer.astro` renders `footerLogoUrl ?? /coat-of-arms-kiribati.svg` — new fallback asset `frontend/public/coat-of-arms-kiribati.svg` (Kiribati coat of arms, from user). Header logo untouched.
- Editor flow: Content Manager → Global Setting → Footer Logo replaces the image site-wide (footer only); unset → coat of arms fallback.
- Verified in browser (dev server): footer shows the coat of arms crisply in the white chip; `tsc --noEmit` (backend), `astro check` (0 errors) + `npm run build` pass clean. Awaiting commit approval.

#### Site Search (merged to `main`, pushed, branch deleted) — ✅ Completed
- Frontend-only. Navbar search icon (left of Contact desktop; beside hamburger mobile) opens an animated full-screen overlay (fade backdrop + fade/slide/scale panel, forced-reflow transition — no rAF, which occluded windows throttle) with debounced (250ms, min 2 chars) fetch-as-you-type results.
- Endpoint: SSR `GET /api/search.json?q=` (`pages/api/search.json.ts`, Zod-validated q, `Cache-Control: max-age=30`) → `lib/search.ts` builds a 60s-TTL module-cached index: parallel soft-fetch of news/services/projects/careers/commissioners/official-documents + uaf/tenders/privacy/terms single types, richtext/Markdown flattened to plain text, merged with a curated `STATIC_PAGES` list (12 routes, summary + keywords). Case-insensitive substring match, title hits ranked first, match-centred excerpts, top 20. Documents deep-link to `/resources?q=<title>` (no detail page); collection links follow the `slug ?? documentId` standard.
- Overlay (`components/layout/SearchOverlay.astro`): all listeners document-delegated so they survive ClientRouter swaps; Esc + backdrop + Esc-chip/✕ close, Cmd/Ctrl+K toggles, `<mark>` highlights (DOM-built, XSS-safe), AbortController cancels stale requests, body scroll-lock. `SearchResult` etc. in `types/search.ts`.
- Command-palette restyle (user request "make it stunning"): frosted panel (`bg-surface/95 backdrop-blur-xl ring-primary/15 rounded-panel`) with blue→green gradient "brand thread" top edge, deep-blue blurred backdrop, expo-out entry (translate+scale). Idle state = server-rendered "Quick links" (5 routes, snapshot via `astro:page-load` → restored on query clear); skeleton-row loading; serif Playfair empty state with suggestion copy; result rows with left accent bar + category color dots (blue informational / green offerings), accent-underline match highlights, 30ms stagger reveal (`search-pop` keyframe, motion-reduce off); footer kbd-hint bar (↑↓/↵/Esc/⌘K, hidden on mobile). **Arrow-key navigation added**: ↑↓ move `data-[selected]` row (wraps, scrollIntoView), Enter opens selected (or first) result. Component `<style>` kills the global `:focus-visible` ring on the input (unlayered global beats utilities).
- Verified in browser (dev server against live Strapi Cloud): icon renders, overlay animates, results for "license"/"tender"/"starlink"/"beacon" correct with highlights + badges, result click navigates and closes overlay, empty + short-query states hold. `astro check` (0 errors) + `npm run build` pass clean. Note: strict substring match — British "licence" finds nothing (content says "license"). Merged + pushed 2026-07-25 (`bd42480`); Vercel auto-deploys.

#### Services nav dropdown (merged to `main`, deployed) — ✅ Completed
- Backend: new `shared.nav-item` component (`label` required, `href` optional, `children` repeatable `shared.nav-link`); `navigation.headerLinks` switched from `shared.nav-link` to it. ⚠️ Component swap resets existing headerLinks rows — re-enter them in Content Manager after deploy (footer columns untouched); local entry confirmed reset to `[]`, footer intact.
- Frontend: `NavHeaderItem` type; `getNavigation()` populate → `populate[headerLinks][populate]=children`, new `normalizeHeaderItems()` (parent href optional, children hrefs slash-normalized). `Header.astro` renders items with children as non-clickable dropdown trigger — desktop pure-CSS `group-hover`/`group-focus-within` menu (Zero-JS), mobile heading + indented sub-links.
- Fallback: `site.ts` nav extracted to typed `NavItem[]` + **Services** group (Class License, Individual License, Domain Name (.ki), Type Approval, Numbering, Radiocommunication — slugs verified against live `/api/services`).
- Deploy-order safe: cloud (old schema) 400s the new populate ("Invalid key children") → fallback nav (incl. Services dropdown) renders until backend deploys + entry republished.
- Verified in browser (local Strapi + Astro dev): dropdown renders desktop + mobile; `tsc --noEmit` (backend), `astro check` (0 errors) + `npm run build` pass clean. Deployed 2026-07-24: Vercel Ready, Strapi Cloud schema live (children populate → 200), cck.ki renders fallback nav with Services dropdown.
- ⏳ Pending content re-entry in Strapi Cloud → Navigation (headerLinks reset by component swap): re-add header links, "Services" parent (no href) + 6 service children, "Rules and Regulations" → `/resources`.

#### Normalize CMS nav hrefs (merged to `main`, deployed) — ✅ Completed
- Frontend-only. Live "Rules and Regulations" header tab 404'd — editor set its `href` to literal `rules and regulations` in the Navigation single type (updated 2026-07-23); most other CMS links also lacked a leading `/`, breaking them from nested routes (`news` → `/news/news`).
- `lib/strapi.ts`: new `normalizeNavHref()` — trims, passes through `http(s):`/`mailto:`/`tel:`/`#`, prepends `/` to internal paths (empty → `/`); applied in `getNavigation()` to `headerLinks` + every `footerColumns[].links` (`?? []` guard). Fallback `site.ts` nav untouched.
- ⚠️ Content fix still required in Strapi Cloud → Navigation: "Rules and Regulations" href must be `/resources` (code can't guess intent — it now yields `/rules and regulations`, still 404). Footer `class-license`/`radiocommunication` point at nonexistent top-level routes — confirm intended targets with client.
- Verified: `astro check` (0 errors) + `npm run build` pass clean; dev server against live Strapi Cloud shows all nav hrefs slash-prefixed on nested routes. Merged + deployed 2026-07-24.

#### Remove legacy Resource collection (merged to `main`, pushed, branch deleted) — ✅ Completed
- Backend-only. Deleted `backend/src/api/resource/` (schema + router/controller/service) — the legacy collection overlapped **Official Document** (which powers `/resources`) and caused a mix-up: an editor added "Radiocommunications Rule 2026" to Resource and it never appeared on the live site.
- Entry was recreated under Official Document on Strapi Cloud (verified live via API) before deletion; no bootstrap permission, seed data, frontend type, or fetch referenced the legacy collection.
- Note: the 4 legacy Resource rows stay orphaned in the DB (Strapi never drops tables on schema removal) but disappear from Content Manager after deploy.
- Verified: `tsc --noEmit` clean; local Strapi boots clean, `/api/resources` → 404, `/api/official-documents` → 200. Merged + pushed 2026-07-25; Strapi Cloud auto-deploys.

#### UAF projects intro + status (added — branch `feature/uaf-projects-status`)
- Backend: `uaf-page` single type gains `projectsIntro` richtext (editable copy rendered right above the projects grid); `project` collection gains `projectStatus` enum (`Completed` / `Currently Implemented`), optional.
- Frontend: `universal-access.astro` renders `marked`-parsed `projectsIntro` in an accent-bordered "Universal Access Projects" block between header and grid (hidden when unset); each project card shows a status pill overlaid on the photo (emerald Completed / sky Currently Implemented). Detail page `projects/[slug].astro` shows the same pill beside the "Universal Access Fund" label.
- Types: `ProjectStatus` union; `projectStatus` on `Project`, `projectsIntro` on `UafPage`.
- Fallback-safe: unset field → no intro block / no pill; layout unchanged.
- Permissions: `api::uaf-page.uaf-page.find` added to bootstrap `PUBLIC_ACTIONS` (`backend/src/index.ts`) — was missing (local `/api/uaf-page` 403'd; cloud had been granted by hand).
- `tsc --noEmit` (backend), `astro check` (0 errors) + `npm run build` pass clean. Verified against local Strapi: schema synced, `/api/projects` exposes `projectStatus`, `/api/uaf-page` → 200. Editor fills UAF Page → `projectsIntro` + each Project → `projectStatus` on Strapi Cloud after deploy.

#### UAF page sectioned layout (added — branch `style/uaf-page-layout`)
- Frontend-only restyle of `universal-access.astro` — the long `description` Markdown is split on `## ` headings and each section rendered by **content shape** (not heading name, so CMS edits survive): all-bullets → 2-col green-check list; `1.` ordered list or lone-number+title+text pseudo-lists → white cards with ghost serif numerals (3 cards → `lg:grid-cols-3`, else 2-col); everything else → prose (first section gets a lead paragraph).
- Zero-JS "On this page" TOC (shown when ≥3 headed sections): sticky left sidebar on `lg`, wrap chips on mobile; anchor ids slugified from headings + `#projects`; `scroll-mt-28` offsets the sticky navbar.
- Projects intro block + status-pill grid unchanged, still full-width at the end (per user). Fallback-safe: description without `##` headings renders as plain prose, no TOC.
- Hover polish (user request): numbered cards lift (`-translate-y-1` + shadow + accent border tint, ghost numeral → accent); sidebar TOC links nudge right + accent color.
- Live project filter (user request): status chips (All / Currently Implemented / Completed, `aria-pressed` styling) + search input filter cards client-side via small vanilla `<script>` — no reload (same pattern as mobile-coverage typeahead). Cards carry `data-status`/`data-search` (title+excerpt, lowercased); entrance animation frozen on first interaction so re-shown cards don't re-reveal; "No matching projects" empty state toggled. Grid now `sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` (gap-6).
- Verified against live Strapi Cloud content via dev server: 5 sections (`overview`…`benefits-to-communities`), 16 check items, 3 step + 4 objective cards, both TOC navs; filter controls + data attrs render (live projects already have statuses set on cloud). `astro check` (0 errors) + `npm run build` pass clean. Awaiting browser review + commit approval.

#### Mobile Operator filter (added — branch `feature/mobile-operator-filter`)
- Frontend-only change to `mobile-coverage.astro` — filter form's **Network type** select (derived 2G/3G/4G options) replaced with **Mobile Operator** (fixed options: Oceanlink, Vodafone).
- URL param `network` → `operator`, validated against the fixed list (same pattern as QoS); matches `r.provider` case-insensitively before island grouping. Island typeahead + QoS filter untouched.
- `astro check` (0 errors) + `npm run build` pass clean. Awaiting commit approval + browser review.

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

#### Distress Beacon Registration (added — branch `feature/distress-beacon`)
- Backend: new `distress-beacon` collection (`draftAndPublish:false`) — base, EPIBP/PLB beacon+vessel, ELT aircraft, mandatory owner+emergency string fields + router/controller/service factories.
- Permissions: `index.ts` bootstrap now grants Public role `api::distress-beacon.distress-beacon.create` (unauthenticated form POST).
- Frontend: new `src/actions/index.ts` — `distressBeacon.register` (`accept:"form"`, Zod 4; owner/emergency `.min(1)`, conditional fields `.optional()`); POSTs `{data}` to `/api/distress-beacons`, throws `ActionError` on non-OK.
- Nav: `Services`→`/services` replaced with `Distress Beacon`→`/distress-beacon` in `site.ts`; legacy `/beacon/register` links (footer + distress CTA) repointed to `/distress-beacon`.
- Page: new SSR `distress-beacon.astro` — intro + Tailwind v4 form, `#vessel-fields`/`#aircraft-fields` `hidden space-y-10` toggled by vanilla `<script>` on `beaconType` change (run once on init); `isInputError` field errors under mandatory inputs, success + ActionError banners.
- Adaptations vs spec: header path was `components/empower/Header.astro` (nonexistent) — nav lives in `src/data/site.ts`; `hidden grid` swapped for `hidden space-y-10` (avoid display-utility conflict).
- `astro check` (0 errors) + `npm run build` pass clean. Strapi schema sync requires `yarn develop` restart. Awaiting commit approval + browser review.

#### Distress Beacon CTA block (added — branch `feature/distress-beacon-cta`)
- Backend: new `blocks.distress-beacon-cta` component (`title`/`subtitle`/`buttonText`/`buttonLink` String, `description` Text, `image` single Media); registered in `page.content` dynamic zone.
- Data: `index.astro` `blockPopulate` adds `"blocks.distress-beacon-cta": ["image"]` → auto-emits `populate[content][on][blocks.distress-beacon-cta][populate]=image`. Astro dev confirmed the live query returns 200.
- Frontend: new `src/components/blocks/DistressBeaconCTA.astro` — 50/50 `md:grid-cols-2` grid, `object-contain` image; `DistressBeaconCtaBlock` type + PageBlock union; mapped in `BlockRenderer.astro`.
- Adaptations vs spec: component lives in `components/blocks/` (not `components/`) for renderer consistency; blue uses semantic `accent` token (theme `primary` is green) — "distress beacon" emphasized via safe text-split span, button `bg-accent`/`hover:bg-accent-hover`.
- `astro check` (0 errors) + `npm run build` pass clean. Renders once an editor adds the block to the home Page entry. Awaiting commit approval + browser review.

#### Editable Navigation (added — branch `feature/editable-navigation`)
- Backend: new `navigation` **single type** (`headerLinks` repeatable `shared.nav-link`, `footerColumns` repeatable `shared.footer-column`) + two new components — `shared.nav-link` (`label`/`href` required) and `shared.footer-column` (`heading` required + repeatable `nav-link` `links`) + router/controller/service factories. Bootstrap (`backend/src/index.ts`) grants Public `api::navigation.navigation.find`.
- Frontend: new `getNavigation()` in `lib/strapi.ts` — fetches `/api/navigation?populate[headerLinks]=true&populate[footerColumns][populate]=links`, returns `{headerLinks, footerColumns}`, falls back to `site.ts` values on 404/unpublished/unreachable **or** empty section (same pattern as `tenders.astro`). `Navigation`/`NavLinkItem`/`FooterColumnItem` types added.
- Frontend: `Header.astro` maps `headerLinks` (desktop + mobile nav) and `Footer.astro` maps `footerColumns` instead of `site.nav`/`site.footer.columns`. `site.ts` retained as fallback + non-nav chrome (name/email/hero/CTAs).
- Note: client adds/edits/removes header links + footer columns/links from Strapi. Prerendered pages pick up changes on rebuild; SSR pages reflect live. Schema sync requires `yarn develop` restart + publishing the single type.
- `astro check` (0 errors) + `npm run build` pass clean (Strapi offline → fallback exercised). Awaiting commit approval + browser review.

#### Privacy + Terms Pages (added — branch `feature/legal-pages`)
- Backend: two new **single types** `privacy-page` + `terms-page` (each `title` string + `content` richtext) + router/controller/service factories. Bootstrap (`backend/src/index.ts`) grants Public `api::privacy-page.privacy-page.find` + `api::terms-page.terms-page.find`.
- Frontend: new SSR `privacy.astro` + `terms.astro` (`prerender=false`) — fetch their single type, `marked`-render `content` with a built-in default-copy fallback when unpublished/404 (same pattern as `tenders.astro`), shared arbitrary-variant prose container. `PrivacyPage` + `TermsPage` types added.
- Footer already linked `/privacy` + `/terms` (bottom bar) — no nav change needed.
- Schema sync requires `yarn develop` restart + publishing each single type (renders default copy until then). `astro check` (0 errors) + `npm run build` pass clean. Awaiting commit approval + browser review.

#### Global Settings (added — branch `feature/global-settings`)
- Backend: new `global-setting` **single type** (`siteName` String, `contactAddress` Text, `contactPhone`/`contactEmail` String, `logo`+`favicon` single image Media) + router/controller/service factories. Bootstrap (`backend/src/index.ts`) grants Public `api::global-setting.global-setting.find`.
- Frontend: new `getGlobalSettings()` in `lib/strapi.ts` — fetches `/api/global-setting?populate=logo,favicon`, returns resolved `GlobalSettings` (absolute `logoUrl`/`faviconUrl` via `mediaUrl`), falls back to `site.ts` per-field on 404/unpublished/empty. `GlobalSetting` (raw) + `GlobalSettings` (resolved) types added.
- Wire-up: `BaseLayout.astro` fetches once → dynamic `<link rel="icon">` (falls back to `/favicon.svg`) + passes `settings` prop to `Header`/`Footer` (per user choice; not self-fetching). `Header`/`Footer` use dynamic logo (`logoUrl ?? /cck-logo.png`) + `siteName`; `Footer` + `contact.astro` use dynamic `contactAddress`/`contactPhone`/`contactEmail`.
- Adaptations vs spec: spec's `empower` template paths don't exist — real files are `layouts/BaseLayout.astro`, `components/layout/{Header,Footer}.astro`, logo `/cck-logo.png` (not `empower-logo-*.webp`); contact data already flowed from `site.ts`, not hardcoded strings. Logo falls back to `/cck-logo.png` (user choice).
- `astro check` (0 errors) + `npm run build` pass clean (Strapi offline → fallback exercised). Schema sync requires `yarn develop` restart + publishing the single type. Awaiting commit approval + browser review.

#### Contact Form Submissions (added — branch `feature/contact-messages`)
- Backend: new `contact-message` collection (`name` String, `email` Email, `subject` String — all required; `message` Text required; `draftAndPublish:false`) + router/controller/service factories. Bootstrap (`backend/src/index.ts`) grants Public `api::contact-message.contact-message.create`.
- Frontend: `contact.send` action handler in `src/actions/index.ts` — replaced the validate-only `console.info` with a POST of `{data}` to `/api/contact-messages` (same pattern as `distressBeacon.register`); throws `ActionError` on non-OK. Honeypot + Zod validation unchanged.
- Submissions now appear in Strapi Content Manager → **Contact Message**. No email notification (future wiring).
- Verified in browser (Playwright against local Strapi): submit → success banner + entry persisted; short-message Zod error + honeypot rejection hold; public `find` correctly 403. 3 test entries left in **local** dev DB — delete from Content Manager. `astro check` (0 errors) + `npm run build` pass clean.
- ⚠️ Deploy note: `frontend/.env` points `STRAPI_URL` at Strapi Cloud (`brave-acoustics-674445e63c.strapiapp.com`) — the form errors ("Could not send your message") until the backend changes are deployed there (POST currently 405s). Bootstrap grants the Public create permission on cloud startup automatically.

#### Email Notifications for Form Submissions (added — branch `feature/email-notifications`)
- Backend-only. New `contact-message` lifecycle hook (`afterCreate`) — emails all submitted fields (name/email/subject/message) to **inquiry@cck.ki** with `replyTo` set to the sender.
- `distress-beacon` lifecycle updated — keeps the applicant confirmation email, adds a second notification to **inquiry@cck.ki** (registration/beacon type, unique ID, owner details, applicant email, emergency contact).
- Both sends are fire-and-forget `strapi.plugins['email'].services.email.send(...).catch(...)` — an email failure is logged (`strapi.log.error`) and never blocks/fails the DB create. Typed `event.result` interfaces (no `any`).
- Adaptations vs spec: collection is `contact-message` (spec said `contact-submission`, which doesn't exist); contact form has no Phone field, so it's omitted from the email.
- ⚠️ No email provider configured (`config/plugins.ts` empty) — local sends fail (caught + logged). On Strapi Cloud the built-in email service is used; for reliable delivery/custom sender configure a real provider (e.g. nodemailer/SendGrid) in `config/plugins.ts`.
- Verified: `tsc --noEmit` clean; local POSTs to both collections → 201 with hooks active (creates unaffected by dead mail transport). Awaiting commit approval.
- Next: SendGrid provider wiring (deferred — user setting up the SendGrid account). Needs: `@strapi/provider-email-sendgrid` install, `email` config in `config/plugins.ts`, `SENDGRID_API_KEY` env (backend/.env + Strapi Cloud Variables), verified sender address for `defaultFrom`.

#### History
- **Resources media URL fix** (branch `fix/resources-media-url`, merged to `main`, branch deleted) — ✅ Completed.
  - `resources/index.astro` prepended `STRAPI_URL` to `doc.file.url` unconditionally — broke View/Download on Strapi Cloud, where media is served absolute from a separate `media.strapiapp.com` host (mangled double-domain links). Now uses the existing `mediaUrl()` helper (handles relative + absolute).
  - Only offender — all other pages already use `mediaUrl()`. Verified live hrefs against Strapi Cloud; `astro check` (0 errors) + `npm run build` pass clean.
- **Resend Email Provider + info@cck.ki recipient** (branch `feature/resend-email-provider`, merged to `main`, branch deleted) — ✅ Completed.
  - Backend-only. Live mail transport via **Resend over SMTP** using official `@strapi/provider-email-nodemailer`: `config/plugins.ts` configures `smtp.resend.com:465` (user `resend`, pass = `RESEND_API_KEY`), `defaultFrom` = `EMAIL_FROM` (must be on the Resend-verified `cck.ki` domain; fallback `onboarding@resend.dev`), `defaultReplyTo` = `EMAIL_REPLY_TO` (default `info@cck.ki`). **No `RESEND_API_KEY` → returns `{}`**, so local dev keeps failing-silently behavior.
  - `OFFICIALS_EMAIL` `inquiry@cck.ki` → **`info@cck.ki`** in both `contact-message` + `distress-beacon` lifecycles.
  - New: contact form now also sends an **acknowledgement email to the submitter** ("We received your message — CCK"), fire-and-forget like the rest.
  - `.env.example` documents `RESEND_API_KEY`/`EMAIL_FROM`/`EMAIL_REPLY_TO`. User has set Resend up (domain verified, API key + `EMAIL_FROM=noreply@cck.ki` in Strapi Cloud Variables).
  - Verified: `tsc --noEmit` clean; boot-tested locally with dummy key (provider config loads, Strapi starts). Live end-to-end send pending user's post-deploy form test.
- **Google Analytics via Partytown** (branch `feature/google-analytics`, awaiting commit approval) — ✅ Completed.
  - Frontend: `@astrojs/partytown` installed (`npx astro add partytown`); `astro.config.mjs` passes `partytown({ config: { forward: ['dataLayer.push'] } })` so main-thread `gtag()` calls reach the web worker — gtag.js runs entirely off the main thread, preserving the Zero-JS standard.
  - Backend: new `googleAnalyticsId` String field on the `global-setting` single type — editor pastes the GA4 measurement ID (e.g. `G-XXXXXXX`) in Content Manager → Global Setting. Schema sync requires `yarn develop` restart + republish.
  - Frontend: `googleAnalyticsId` threaded through `GlobalSetting`/`GlobalSettings` types + `getGlobalSettings()` (`undefined` fallback = analytics disabled); `BaseLayout.astro` `<head>` conditionally renders the gtag.js loader + init snippet only when the ID exists, both `is:inline type="text/partytown"` (ID injected via `encodeURIComponent`/`JSON.stringify`).
  - Adaptations vs spec: layout is `layouts/BaseLayout.astro` (spec said `Layout.astro`, which doesn't exist).
  - ⚠️ CSP note: `security.csp: true` is on — Partytown injects its own inline loader snippet and `is:inline` scripts aren't auto-hashed by Astro's CSP; once a GA ID is published, verify in the browser console that the loader isn't CSP-blocked (fix would be adding its hash to `security.csp.scriptDirective.hashes`).
  - Verified: `astro check` (0 errors) + `npm run build` pass clean; Partytown worker assets emitted to `.vercel/output/static/~partytown/`. Browser/GA-network verification pending until a measurement ID is set in Strapi.
- **Org chart black background in dark mode** (branch `fix/org-chart-dark-mode`, merged to `main`, branch deleted) — ✅ Completed.
  - Highcharts 13 auto-themes from the page CSS `color-scheme`; visitors with OS dark mode saw a black chart canvas on `/about` (Organisation Structure).
  - Fix in `OrgChart.astro`: `[color-scheme:light]` on the chart container + explicit `chart.backgroundColor: "#ffffff"`.
  - Follow-up (branch `fix/org-chart-explicit-colors`, merged, deleted): dark theme sits behind an OS-level `@media (prefers-color-scheme: dark)` rule that container `color-scheme` can't override — connector links were invisible + tooltip black for dark-mode visitors. Explicit `link: {color:"#94a3b8"}` + white tooltip added.
  - Verified in browser; `astro check` (0 errors) + `npm run build` pass clean. Pushed to origin.
- **Strapi CORS restriction** (branch `chore/strapi-cors`, merged to `main`, branch deleted) — ✅ Completed.
  - `backend/config/middlewares.ts`: `'strapi::cors'` → object form with `config.origin` allowlist: `http://localhost:4321`, the Vercel frontend URL, `https://cck.gov.ki`.
  - Trailing slash stripped from the Vercel origin (CORS matches the browser `Origin` header exactly — never has one).
  - ⚠️ Allowlisted Vercel URL is deployment-specific (`cckastro-j8mj3yb9c-…`); swap for the stable project domain once known or CORS breaks on next deploy.
  - Verified live: Strapi auto-restarted, `Access-Control-Allow-Origin: http://localhost:4321` returned for dev origin.
- **Vercel Adapter** (branch `chore/vercel-adapter`, merged to `main`, branch deleted) — ✅ Completed.
  - Swapped SSR adapter for Vercel hosting: `@astrojs/node` → `@astrojs/vercel@^10.0.8` (v10 is the Astro 6-compatible major; v11 requires Astro 7). `adapter: vercel()` in `astro.config.mjs`; `.vercel/` gitignored.
  - `image.remotePatterns` now authorizes the production Strapi host (`cckastrobackend-nys32.ondigitalocean.app`) alongside `localhost`.
  - Deploy note: set `STRAPI_URL` env var in Vercel project settings (inlined at build time; defaults to `http://localhost:1337`).
  - `astro check` (0 errors) + `npm run build` pass clean (emits `.vercel/output`).
- **Sticky White Navbar + header logo/tagline** (branch `fix/sticky-white-navbar`, merged to `main`, branch deleted) — ✅ Completed.
  - Home page navbar switched from transparent overlay to the sticky white variant used on every other page: `index.astro` no longer computes/passes `heroOverlay`; `Hero.astro` padding evened to `py-24 lg:py-40` (no absolute header to clear). Overlay props left in `Header.astro`/`BaseLayout.astro` (default `false`, unused) for easy revert.
  - Header logo enlarged `h-10 w-10` (40px) → `h-14 w-14` (56px); source PNG is 500×500 so no image change. Footer logo untouched.
  - Editable tagline: new `tagline` String on `global-setting` single type; threaded through `GlobalSetting`/`GlobalSettings` types + `getGlobalSettings()` (falls back to `site.tagline` = "Comms Commission of Kiribati"); `Header.astro` renders `{settings.tagline}`. Client edits it in Content Manager → Global Setting.
  - Verified in dev; `astro check` (0 errors) + `npm run build` pass clean.
- **Mobile Coverage filters** (branch `feature/mobile-coverage-filter`, merged to `main`, branch deleted) — ✅ Completed.
  - Frontend-only change to SSR `mobile-coverage.astro` — no backend/schema/data changes.
  - Filter form (zero-JS GET → SSR re-render) above the island-card grid: **Island**, **Quality of service** (Good/Average/Poor enum), **Network type**. Conditional Reset; filtered-empty state.
  - Options: `islandOptions` + `networkOptions` derived from the *unfiltered* record set; rows filtered before grouping so each island card shows only matching providers.
  - Island is a **live client-side typeahead** (`type="search"` + `<datalist>`): a small `<script>` substring-matches `data-island` cards as the user types and toggles a "No islands match …" message. Server-side island match switched to substring so live + submitted (after QoS/network Apply) results agree; `name="island"` retained so the typed value survives a GET submit.
  - `astro check` (0 errors) + `npm run build` pass clean.
- **Tenders Page + Playfair font** (branch `feature/tenders-page`, merged to `main`, branch deleted) — ✅ Completed.
  - Backend: new `tenders-page` **single type** (`title` string, `description` richtext, `buttonText` string, `buttonLink` string) + router/controller/service factories. Bootstrap (`backend/src/index.ts`) grants Public `api::tenders-page.tenders-page.find`.
  - Frontend: new SSR `tenders.astro` (`prerender=false`) — fetches `/api/tenders-page`, `marked`-renders the application-process copy (with a built-in default-copy fallback when the single type is unpublished/404), `bg-accent` CTA button (`buttonText`→`buttonLink`, defaults to "Visit the Customer Portal" → `#`). Explains the process; does **not** list open tenders, per spec. `TendersPage` type added; `Tenders`→`/tenders` added to `site.ts` main nav (Header + Footer).
  - Font: heading `--font-serif` token switched from Lora to **Playfair Display** (site-wide); self-hosted via `@fontsource/playfair-display` (500/600/700), `@fontsource/lora` uninstalled, `env.d.ts` module declaration updated.
  - Verified: Strapi 5.48 restart synced schema (`/api/tenders-page` → 200-shaped 404 `data:null`, confirming perm applied, not 403); `/tenders` renders 200 with default copy; `astro check` + `npm run build` pass clean. Two focused commits (`feat` page, `style` font).
- **Careers Page** (branch `feature/careers-page`, merged to `main`) — ✅ Completed.
  - Backend: new `career` collection (`title` String, `description` richtext, `deadline` Date; all required; `draftAndPublish:true`) + `careers-page` single type (`title`/`intro`/`applicationInfo` richtext — editable page copy) + router/controller/service factories for both.
  - Permissions: `backend/src/index.ts` bootstrap grants Public role `api::career.career.find` + `findOne` and `api::careers-page.careers-page.find` (fixes initial 403 on the public listing/detail fetches).
  - Frontend: SSR `careers/index.astro` — parallel fetch of `/api/careers-page` (editable heading+intro, default fallbacks) + `/api/careers?filters[deadline][$gte]={today}&sort=deadline:asc` (open roles only); jobs render as a **table** (Position / Application Deadline), title + "View" both link to detail, lime deadline pill, "No job openings" empty state.
  - Frontend: SSR detail route `careers/[documentId].astro` — full `marked`-rendered description (styled prose), deadline pill (auto "Closed" if past), "How to apply" → `recruit@cck.ki` callout, back link; 404 + "Job not found" state.
  - Types: `Career` + `CareersPage` added to `types/strapi.ts`. Footer already linked `/careers`.
  - Note: `applicationInfo` single-type field currently unused by the frontend (detail page hardcodes the apply callout) — kept for future wiring.
  - Verified: Strapi restart applied the bootstrap; `/api/careers` → 200, `/careers` page renders (200) with the "No job openings" state until entries are published.
- **More News section** (branch `feature/news-more-news`, merged to `main`) — ✅ Completed. `news/[documentId].astro` appends a 3-col "More News" grid (image/date/title cards) of the 3 latest other articles.
