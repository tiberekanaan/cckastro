// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import icon from 'astro-icon';

import partytown from '@astrojs/partytown';

// https://astro.build/config
export default defineConfig({
  site: 'https://cck.gov.ki',
  // Vercel adapter: index.astro is SSR (prerender = false) to fetch live Strapi data.
  adapter: vercel(),
  integrations: [
    icon(),
    // Google Analytics runs in a web worker; forward gtag's dataLayer.push
    // calls from the main thread so events reach the worker.
    partytown({ config: { forward: ['dataLayer.push'] } }),
  ],
  image: {
    // Authorize the Strapi host so <Image /> can optimize remote media.
    // Add the production Strapi hostname here before deploying.
    //remotePatterns: [{ protocol: 'http', hostname: 'localhost' }],
    remotePatterns: [
    { protocol: 'http', hostname: 'localhost' },
    { protocol: 'https', hostname: 'web.cck.ki' } // Production Strapi (custom domain on Strapi Cloud)
  ],
  },
  security: {
    // Content Security Policy on by default to protect against XSS.
    csp: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});