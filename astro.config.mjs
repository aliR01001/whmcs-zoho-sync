import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'server',

  // Will use Cloudflare Pages adapter
  adapter: cloudflare(),

  vite: {
    plugins: [tailwindcss()]
  }
});