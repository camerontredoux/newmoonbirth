// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://newmoonbirth.com',
  trailingSlash: 'always',
  integrations: [react(), sitemap()],

  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Gilda Display',
      cssVariable: '--font-gilda',
      weights: [400],
      styles: ['normal'],
      subsets: ['latin'],
      // "Gilda Display fallback" is defined in global.css.
      fallbacks: ['Gilda Display fallback', 'Georgia', 'serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Corinthia',
      cssVariable: '--font-corinthia',
      weights: [400],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['cursive'],
    },
    {
      provider: fontProviders.google(),
      name: 'Jost',
      cssVariable: '--font-jost',
      weights: [300, 400, 500],
      styles: ['normal'],
      subsets: ['latin'],
      // "Jost fallback" is defined in global.css.
      fallbacks: ['Jost fallback', 'sans-serif'],
    },
  ],

  vite: {
    plugins: [tailwindcss()]
  },

  // Every page is prerendered, so resize images with sharp at build time.
  adapter: cloudflare({ imageService: 'compile' })
});
