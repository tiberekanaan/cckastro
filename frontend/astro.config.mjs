// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://cck.gov.ki',
  // Node adapter: index.astro is SSR (prerender = false) to fetch live Strapi data.
  adapter: node({ mode: 'standalone' }),
  image: {
    // Authorize the Strapi host so <Image /> can optimize remote media.
    // Add the production Strapi hostname here before deploying.
    remotePatterns: [{ protocol: 'http', hostname: 'localhost' }],
  },
  security: {
    // Content Security Policy on by default to protect against XSS.
    csp: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
