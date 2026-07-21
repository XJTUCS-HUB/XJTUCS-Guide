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
    type: z.enum(['notes', 'experience', 'past-paper']),
    author: z.string(),
    updated: z.coerce.date(),
    order: z.number().default(999),
  }),
});

// 课程级公共内容：考核信息、外部资源等。
// 与 resources 不同，这类内容属于课程整体而非某个贡献者，
// 直接在课程页内联渲染，不生成独立资源页、不按作者分组。
// 文件按 `{课程代码}/{类型}.md` 组织，例如 `eelc400105/assessment.md`。
const courseContent = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/courseContent' }),
  schema: z.object({
    course: z.string(),
    type: z.enum(['assessment', 'external']),
    updated: z.coerce.date(),
  }),
});

export const collections = { courses, resources, courseContent };
