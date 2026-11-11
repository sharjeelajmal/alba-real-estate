// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

/** Routes that must never be indexed or listed in the sitemap. */
const PRIVATE_ROUTES = ['/thank-you/', '/styleguide/', '/admin/', '/404'];

export default defineConfig({
  site: 'https://albarealestategroup.com',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  integrations: [
    sitemap({
      filter: (page) => !PRIVATE_ROUTES.some((route) => new URL(page).pathname.startsWith(route)),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
