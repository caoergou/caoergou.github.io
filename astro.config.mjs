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
      i18n: {
        defaultLocale: 'zh',
        locales: {
          zh: 'zh-CN',
          en: 'en-US',
        },
      },
      filter: (page) => true,
      customPages: [
        'https://eric.run.place/',
        'https://eric.run.place/blog/',
        // MermZen 子路径
        'https://eric.run.place/MermZen/',
        'https://eric.run.place/MermZen/blog/zh/',
        'https://eric.run.place/MermZen/blog/en/',
        // Windows XP
        'https://eric.run.place/windows-xp/',
      ],
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: 'nord',
    },
  },
});
