import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: undefined, // Will use Cloudflare Pages adapter
});
