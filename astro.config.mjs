import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://eric.run.place',
  base: '/',
  integrations: [
    react(),
    mdx(),
    sitemap({
      filter: (page) => true,
      customPages: [
        'https://eric.run.place/',
        'https://eric.run.place/blog/',
        'https://eric.run.place/MermZen/',
        'https://eric.run.place/windows-xp/',
      ],
      changefreq: 'weekly',
      priority: 0.7,
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: 'nord',
    },
  },
});
