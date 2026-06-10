import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  const posts = await getCollection('posts');

  const sortedPosts = posts
    .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());

  return rss({
    title: 'Eric Cao - Blog',
    description: 'Tech blog by Eric Cao — Python, Distributed Systems, AI Applications',
    site: context.site!,
    items: sortedPosts.map(post => {
      const [lang, ...rest] = post.id.split('/');
      const slug = rest.join('/');
      return {
        title: `${post.data.title}${lang === 'en' ? ' (EN)' : ''}`,
        description: post.data.description,
        pubDate: new Date(post.data.date),
        link: `/blog/${lang}/${slug}/`,
      };
    }),
    customData: '<language>zh-CN</language>',
  });
};
