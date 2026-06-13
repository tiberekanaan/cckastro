### Developer Knowledge Hub
A developer knowledge hub for snippets, commands, prompts, notes, files, images, links and custom types for our Astro 6 + Storyblok project.

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

#### Astro 6 & Storyblok Coding Standards & Rules
When generating or modifying frontend code, adhere to the following Astro 6 and Storyblok standards:

*   **Routing & Transitions:** Use the `<ClientRouter />` component for view transitions; the old `<ViewTransitions />` component has been removed in v6.0.
*   **Data Fetching:** Fetch CMS data using the `@storyblok/astro` integration via the `useStoryblokApi` hook [5] or Storyblok's Astro Content Loader [6]. 
*   **Dynamic Component Rendering:** Always map Storyblok components in `astro.config.mjs` and use `<StoryblokComponent blok={blok} />` to dynamically render nested Bloks [3, 7].
*   **Visual Editor Support:** Apply the `storyblokEditable(blok)` utility function to parent elements in your Astro components to enable live editing inside the Storyblok Visual Editor [4].
*   **Rich Text:** Use the `renderRichText` helper function provided by the integration to transform Storyblok rich text fields into HTML [4].
*   **Dynamic Content:** Use Server Islands with the `server:defer` directive for dynamic user-specific components.
*   **Schemas:** We are using Zod 4. Format validations like `z.string().email()` should now be written directly as `z.email()`.
*   **Environment Variables:** Access environment variables inline using `import.meta.env` (e.g., `import.meta.env.STORYBLOK_TOKEN`) as it is strictly inlined in v6 [8].

#### Agent Interaction Rules
*   **NO PLEASANTRIES**: Do not say "Sure, I can help with that," "Here is the code," or "Let me know if you need anything else."
*   **NO CODE REPEATS**: When modifying existing code, only output the changed lines or functions. Do not rewrite unchanged context. Use placeholder comments like `// ... existing code ...` to indicate skipped sections.
*   **CONCISE LOGIC**: Explain architectural decisions in bullet points of under 10 words.
*   **DRY RUN FIRST**: If a task requires structural changes, outline the plan in 3 bullet points and wait for my confirmation before writing code.
*   **ACKNOWLEDGE**: Acknowledge with "Ready." and nothing else.
