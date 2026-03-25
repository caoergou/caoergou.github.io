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
      // 自定义每个页面的 sitemap 条目
      serialize: (item) => {
        // 根据路径自定义优先级和更新频率
        if (item.url === 'https://eric.run.place/' || item.url.endsWith('/index.html')) {
          return {
            ...item,
            changefreq: 'weekly',
            priority: 1.0,
            lastmod: new Date().toISOString(),
          };
        }
        // 博客文章
        if (item.url.includes('/blog/')) {
          return {
            ...item,
            changefreq: 'monthly',
            priority: 0.8,
          };
        }
        // 项目页面
        if (item.url.includes('/projects/')) {
          return {
            ...item,
            changefreq: 'monthly',
            priority: 0.6,
          };
        }
        // 其他页面
        return {
          ...item,
          changefreq: 'monthly',
          priority: 0.5,
        };
      },
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: 'nord',
    },
  },
});
