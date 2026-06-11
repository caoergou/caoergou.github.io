import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

// 从博客 frontmatter 提取 URL 路径 → date 的映射，用于 sitemap lastmod
function getBlogLastMods() {
  const dates = {};
  const langs = ['zh', 'en'];
  for (const lang of langs) {
    const dir = join('src/content/posts', lang);
    let files;
    try { files = readdirSync(dir); } catch { continue; }
    for (const file of files) {
      if (!file.endsWith('.md') && !file.endsWith('.mdx')) continue;
      const content = readFileSync(join(dir, file), 'utf-8');
      const dateMatch = content.match(/^date:\s*["']?(\d{4}-\d{2}-\d{2})/m);
      if (!dateMatch) continue;
      const slug = file.replace(/\.(md|mdx)$/, '');
      dates[`/blog/${lang}/${slug}/`] = dateMatch[1];
    }
  }
  return dates;
}

const blogLastMods = getBlogLastMods();

// 首页 lastmod 取自最新一篇博客日期（内容驱动，避免每次构建都变动产生噪音）
const latestContentDate = Object.values(blogLastMods).sort().pop();
const homeLastMod = latestContentDate ? new Date(latestContentDate).toISOString() : undefined;

// 首页中英双语 hreflang 互链
const homeLinks = [
  { lang: 'zh-CN', url: 'https://eric.run.place/' },
  { lang: 'en', url: 'https://eric.run.place/en/' },
];

export default defineConfig({
  site: 'https://eric.run.place',
  base: '/',
  integrations: [
    react(),
    mdx(),
    sitemap({
      // MermZen 有独立 sitemap，由 robots.txt 单独声明，此处只生成主站页面
      changefreq: 'weekly',
      priority: 0.7,
      serialize: (item) => {
        const path = new URL(item.url).pathname;

        // 中文首页
        if (path === '/') {
          return { ...item, changefreq: 'weekly', priority: 1.0, lastmod: homeLastMod, links: homeLinks };
        }

        // 英文首页
        if (path === '/en/' || path === '/en') {
          return { ...item, changefreq: 'weekly', priority: 0.9, lastmod: homeLastMod, links: homeLinks };
        }

        // /blog/{slug}/ 是 301 重定向页，不应出现在 sitemap
        if (path.match(/^\/blog\/[^/]+\/?$/) && !path.match(/^\/blog\/(zh|en)\//)) {
          return undefined;
        }

        // 博客文章（带语言前缀）：lastmod 取自 frontmatter date
        const blogLangMatch = path.match(/^\/blog\/(zh|en)\/([^/]+)/);
        if (blogLangMatch) {
          const [, lang, slug] = blogLangMatch;
          const lastmod = blogLastMods[path]
            ? new Date(blogLastMods[path]).toISOString()
            : undefined;
          return {
            ...item,
            changefreq: 'monthly',
            priority: lang === 'zh' ? 0.8 : 0.6,
            lastmod,
            links: [
              { lang: 'zh-CN', url: `https://eric.run.place/blog/zh/${slug}/` },
              { lang: 'en', url: `https://eric.run.place/blog/en/${slug}/` },
            ],
          };
        }

        // 博客列表页
        if (path.startsWith('/blog')) {
          return { ...item, changefreq: 'weekly', priority: 0.7 };
        }

        return { ...item, changefreq: 'monthly', priority: 0.5 };
      },
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: 'nord',
    },
    remarkRehype: {
      allowDangerousHtml: true,
    },
  },
});
