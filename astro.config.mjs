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
      // 子项目 (MermZen, windows-xp) 有自己的 sitemap，不需要在主站 sitemap 中重复声明
      // 详见: robots.txt 中引用了所有 sitemap
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
