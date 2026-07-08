// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  site: 'https://cck.gov.ki',
  // Vercel adapter: index.astro is SSR (prerender = false) to fetch live Strapi data.
  adapter: vercel(),
  integrations: [icon()],
  image: {
    // Authorize the Strapi host so <Image /> can optimize remote media.
    // Add the production Strapi hostname here before deploying.
    //remotePatterns: [{ protocol: 'http', hostname: 'localhost' }],
    remotePatterns: [
    { protocol: 'http', hostname: 'localhost' },
    { protocol: 'https', hostname: 'cckastrobackend-nys32.ondigitalocean.app' } // Add your production Strapi domain here
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
