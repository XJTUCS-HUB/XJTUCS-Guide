import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const courses = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/courses' }),
  schema: z.object({
    code: z.string(),
    name: z.string(),
    category: z.string(),
    requirement: z.enum(['required', 'elective']),
    credits: z.number().optional(),
    summary: z.string(),
    updated: z.coerce.date(),
  }),
});

const resources = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/resources' }),
  schema: z.object({
    title: z.string(),
    course: z.string(),
    type: z.enum(['notes', 'lab', 'assessment', 'experience', 'past-paper', 'external']),
    author: z.string(),
    updated: z.coerce.date(),
    order: z.number().default(999),
  }),
});

export const collections = { courses, resources };
