/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Base URL of the Strapi 5 backend, e.g. http://localhost:1337 */
  readonly STRAPI_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Side-effect CSS imports from Fontsource packages.
declare module "@fontsource-variable/inter";
declare module "@fontsource/lora/*";
