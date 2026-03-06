import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    type: z.enum(['linked', 'personal']),
    url: z.string().optional(),
    demo_url: z.string().optional(),
    stars: z.number().optional(),
    tags: z.array(z.string()),
    featured: z.boolean().optional(),
    desc_zh: z.string(),
    desc_en: z.string(),
  }),
});

const thoughts = defineCollection({
  type: 'content',
  schema: z.object({
    title_zh: z.string(),
    title_en: z.string(),
    desc_zh: z.string(),
    desc_en: z.string(),
    author: z.string(),
    date: z.string(),
  }),
});

const profile = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    title_zh: z.string(),
    title_en: z.string(),
    tagline_zh: z.string(),
    tagline_en: z.string(),
    quote_zh: z.string(),
    quote_en: z.string(),
    quote_author: z.string(),
    avatar: z.string().optional(),
    social_links: z.array(
      z.object({
        name: z.string(),
        url: z.string(),
        icon: z.string(),
      })
    ),
  }),
});

export const collections = {
  projects,
  thoughts,
  profile,
};
