### Coding Standards

#### TypeScript
*  Strict mode enabled.
*  No `any` types - use proper typing or `unknown`.
*  Define interfaces/types for all props and data models, particularly for the `blok` properties passed down from Storyblok.
*  Use type inference where obvious, explicit types where helpful.

#### Astro, UI Components & Storyblok
*   **Zero-JS by Default:** Use `.astro` functional components for UI layout and structure.
*   **Client Islands:** Only use UI framework components (React/Vue/Svelte) when client-side interactivity is strictly required, applying directives like `client:load` or `client:idle`.
*   **Server Islands:** Use the `server:defer` directive with a `<Fragment slot="fallback">` on Astro components for personalized or highly dynamic content to delay rendering without blocking the initial page load.
*   **Blok Components:** Create Astro components in `src/storyblok/` to correspond exactly with Storyblok Blok names (e.g., `Feature.astro`, `Grid.astro`, `Page.astro`) [9].
*   **Component Registration:** Register all Storyblok components in the `components` object inside `astro.config.mjs`. If the name doesn't match the Storyblok Blok name perfectly, it will throw an error [3, 10].

#### Data Fetching & Content Management
*   **Storyblok API:** Initialize fetching with the `useStoryblokApi` hook [5]. Query the API using endpoints like `cdn/stories/...` and pass `version: 'draft'` in development to see live changes, and `version: 'published'` for production [11].
*   **Dynamic Routing:** Use Astro's dynamic routes (e.g., `src/pages/blog/[...slug].astro`) to fetch page data based on Storyblok slugs [12, 13]. 
*   **Zod 4 Validation:** Validate all fetched CMS content and user inputs using Zod 4. Import `z` from `astro/zod`.

#### Astro Actions (Mutations & Forms)
*  Use **Astro Actions** for form submissions and client-to-server mutations instead of standard API endpoints.
*  Define all actions in `src/actions/index.ts`.
*  Automatically validate JSON and form data inputs using Zod schemas within the action's `input` property.

#### Tailwind CSS v4
**CRITICAL**: We are using Tailwind CSS v4 via the `@tailwindcss/vite` plugin, which uses CSS-based configuration.
*   **DO NOT** create `tailwind.config.ts` or `tailwind.config.js` files (those are for v3).
*  All theme configuration must be done in CSS using the `@theme` directive in `src/styles/global.css` (or your main stylesheet).
*  Use CSS custom properties for colors, spacing, etc., specifically using semantic **OKLCH color tokens**.
*  No JavaScript-based config allowed.

#### File Organization
*  Pages: `src/pages/[route]/index.astro`
*  Storyblok Bloks: `src/storyblok/[BlokName].astro` [14]
*  Components: `src/components/[feature]/ComponentName.astro`
*  Server Actions: `src/actions/index.ts`
*  Content Configuration: `src/content.config.ts`
*  Styles: `src/styles/global.css`
*  Types: `src/types/[feature].ts`
*  Lib/Utils: `src/lib/[utility].ts`

#### Error Handling
*   **Action Errors:** Throw backend errors using `ActionError` from `astro:actions` with standard HTTP status codes (e.g., `NOT_FOUND`, `UNAUTHORIZED`).
*   **Input Errors:** Validate form errors safely on the frontend using the `isInputError()` utility to display field-specific validation messages.