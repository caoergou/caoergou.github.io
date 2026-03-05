import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    type: z.enum(['linked', 'personal']),
    url: z.string().optional(),
    stars: z.string().optional(),
    tags: z.array(z.string()),
  }),
});

const thoughts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    author: z.string(),
    date: z.string(),
  }),
});

const profile = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    title: z.string(),
    tagline: z.string(),
    quote: z.string(),
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
