/**
 * Single source of truth for post create/update validation, shared by the editor
 * form and the `/api/seoteam/posts` route handlers (mirrors how `lib/contact.ts`
 * shares one zod schema between the contact form and its route).
 */
import { z } from 'zod';
import { KEYWORD_REL_VALUES, POST_TEMPLATE_IDS, POST_STATUSES } from '@/lib/db/models/post';

export const keywordSchema = z.object({
  keyword: z.string().trim().min(1, 'Keyword is required'),
  url: z
    .string()
    .trim()
    .url('Enter a valid URL')
    // Block javascript:/data: and other unsafe schemes — z.string().url() alone allows them.
    .refine((u) => /^https?:\/\//i.test(u) || /^mailto:/i.test(u), {
      message: 'URL must start with http://, https://, or mailto:',
    }),
  rel: z.enum(KEYWORD_REL_VALUES).default('dofollow'),
});

export const postInputSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]*$/, 'Use lowercase letters, numbers and dashes only')
    .optional(),
  template: z.enum(POST_TEMPLATE_IDS).default('generic'),
  body: z.string().default(''),
  excerpt: z.string().trim().max(300).default(''),
  metaTitle: z.string().trim().max(200).default(''),
  category: z.string().trim().max(60).default('Guides'),
  tags: z.array(z.string().trim().min(1)).default([]),
  coverImage: z.string().trim().url('Enter a valid image URL').or(z.literal('')).default(''),
  keywords: z.array(keywordSchema).default([]),
  linkAllOccurrences: z.boolean().default(false),
  author: z
    .object({
      name: z.string().trim().min(1).default('LocalShout Team'),
      role: z.string().trim().default(''),
    })
    .default({ name: 'LocalShout Team', role: '' }),
  status: z.enum(POST_STATUSES).default('draft'),
});

export type PostInput = z.infer<typeof postInputSchema>;

/** Partial variant for PATCH updates. */
export const postUpdateSchema = postInputSchema.partial();
export type PostUpdate = z.infer<typeof postUpdateSchema>;
