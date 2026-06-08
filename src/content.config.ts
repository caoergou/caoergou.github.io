import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const i18nText = z.object({
  zh: z.string(),
  en: z.string(),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    type: z.enum(['linked', 'personal']),
    url: z.string().optional(),
    github: z.string().optional(),
    demo_url: z.string().optional(),
    stars: z.number().optional(),
    tags: z.array(z.string()),
    technologies: z.array(z.string()).optional(),
    featured: z.boolean().optional(),
    description: i18nText,
  }),
});

const thoughts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/thoughts' }),
  schema: z.object({
    title: i18nText,
    description: i18nText,
    author: z.string(),
    date: z.string(),
  }),
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    author: z.string(),
    date: z.union([z.string(), z.date().transform(d => d.toISOString().split('T')[0])]),
  }),
});

const profile = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/profile' }),
  schema: z.object({
    name: z.string(),
    title: i18nText,
    tagline: i18nText,
    quote: i18nText.optional(),
    quote_author: z.string().optional(),
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
  posts,
  profile,
};
