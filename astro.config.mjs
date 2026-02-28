import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://eric.run.place',
  base: '/',
  integrations: [react(), mdx()],
  markdown: {
    shikiConfig: {
      theme: 'nord',
    },
  },
});
