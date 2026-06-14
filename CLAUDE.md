### Developer Knowledge Hub
A developer knowledge hub for snippets, commands, prompts, notes, files, images, links and custom types for our **Astro 6 + Strapi 5 project**.

#### Context Files
Read the following to get the full context of the project:
*  @./context/project-overview.md
*  @./context/coding-standards.md
*  @./context/ai-interaction.md
*  @./context/current-feature.md 

#### Commands
##### Frontend (Astro 6)
* `npm run dev` - Starts the Astro dev server
* `npm run build` - Builds the Astro site for production

##### Backend (Strapi 5)
* `yarn develop` - Starts the Strapi backend in development mode
* `yarn seed` - Seeds the database with initial dummy data

#### Astro 6 Coding Standards & Rules
When generating or modifying frontend code, adhere to the following Astro 6 standards:

*   **Routing & Transitions:** Use the `<ClientRouter />` component for view transitions; the old `<ViewTransitions />` component has been removed in v6.0.
*   **Data Fetching:** Fetch CMS data using the Content Loader API (`src/content.config.ts`) and the Strapi Community Astro Loader for collections.
*   **Dynamic Content:** Use Server Islands with the `server:defer` directive for dynamic user-specific components.
*   **File Imports:** Use Vite's `import.meta.glob()` to load local files; `Astro.glob()` has been completely removed in Astro 6.
*   **Schemas:** We are using Zod 4. Import `z` from `astro/zod` and write format validations directly, such as `z.email()` instead of `z.string().email()`.
*   **Environment Variables:** Access environment variables inline using `import.meta.env` (e.g., `import.meta.env.SITE`) as they are strictly inlined in v6.

#### Strapi 5 Coding Standards & Rules
When generating or modifying backend code, adhere to the following Strapi 5 standards:

*   **Document Service API:** Always use the new Document Service API (`strapi.documents`) for CRUD operations instead of the deprecated Entity Service API.
*   **Identifiers:** Query and reference entries using the **24-character alphanumeric `documentId`** rather than the legacy numeric `id`.
*   **Draft & Publish:** Utilize the Document API's methods like `publish()`, `unpublish()`, and `discardDraft()` to manage content states programmatically.
*   **Responses:** Expect flattened API responses by default (no need to heavily map through `.attributes` wrappers like in v4).

#### Agent Interaction Rules
*   **NO PLEASANTRIES:** Do not say "Sure, I can help with that," "Here is the code," or "Let me know if you need anything else."
*   **NO CODE REPEATS:** When modifying existing code, only output the changed lines or functions. Do not rewrite unchanged context. Use placeholder comments like `// ... existing code ...` to indicate skipped sections.
*   **CONCISE LOGIC:** Explain architectural decisions in bullet points of under 10 words.
*   **DRY RUN FIRST:** If a task requires structural changes, outline the plan in 3 bullet points and wait for my confirmation before writing code [17].
*   **ACKNOWLEDGE:** Acknowledge with "Ready." and nothing else.