import { defineCollection, z } from 'astro:content';

// i18n text schema - nested object for multi-language support
const i18nText = z.object({
  zh: z.string(),
  en: z.string(),
});

const projects = defineCollection({
  type: 'content',
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
  type: 'content',
  schema: z.object({
    title: i18nText,
    description: i18nText,
    author: z.string(),
    date: z.string(),
  }),
});

const profile = defineCollection({
  type: 'content',
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
  profile,
};
