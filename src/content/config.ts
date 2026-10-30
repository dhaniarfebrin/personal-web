import { z, defineCollection } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.date(),
    image: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const projectsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string().optional(),
    technologies: z.array(z.string()),
    liveUrl: z.string().optional(),
    githubUrl: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

const ym = z.string().regex(/^\d{4}-\d{2}$/);

const experienceCollection = defineCollection({
  type: 'data',
  schema: z.object({
    org: z.string(),
    role: z.string(),
    kind: z.enum(['work', 'internship', 'program', 'education']),
    start: ym,
    end: ym.optional(),
    location: z.string().optional(),
    summary: z.string().optional(),
    highlights: z.array(z.string()).default([]),
    technologies: z.array(z.string()).default([]),
  }),
});

export const collections = {
  blog: blogCollection,
  projects: projectsCollection,
  experience: experienceCollection,
};
