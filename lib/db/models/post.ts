/**
 * The `Post` model backing the private SEO dashboard and the public `/blog`.
 * Posts are authored in `/seoteam`, stored here, and rendered on `/blog` the
 * moment they're published — no redeploy. The model guards against re-
 * registration so HMR / serverless module reuse doesn't throw.
 */
import 'server-only';
import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';
import {
  KEYWORD_REL_VALUES,
  POST_TEMPLATE_IDS,
  POST_STATUSES,
} from '@/lib/db/post-constants';

// Re-export the client-safe enums/types so existing server importers keep working.
export {
  KEYWORD_REL_VALUES,
  POST_TEMPLATE_IDS,
  POST_STATUSES,
} from '@/lib/db/post-constants';
export type { KeywordRel, PostTemplateId, PostStatus } from '@/lib/db/post-constants';

const keywordSchema = new Schema(
  {
    keyword: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    rel: { type: String, enum: KEYWORD_REL_VALUES, default: 'dofollow' },
  },
  { _id: false },
);

const postSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    // Unique, URL-safe, auto-generated from the title but editable.
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    template: { type: String, enum: POST_TEMPLATE_IDS, default: 'generic' },
    // Sanitized HTML produced by the WYSIWYG editor.
    body: { type: String, default: '' },
    // Doubles as the meta description + card/list excerpt.
    excerpt: { type: String, default: '', trim: true },
    // Defaults to `title` when blank (resolved at read time).
    metaTitle: { type: String, default: '', trim: true },
    // Editorial category — drives the index filter, breadcrumbs, and cover gradient.
    category: { type: String, default: 'Guides', trim: true },
    tags: { type: [String], default: [] },
    coverImage: { type: String, default: '', trim: true },
    keywords: { type: [keywordSchema], default: [] },
    // false → link only the first occurrence of each keyword (avoids over-optimization).
    linkAllOccurrences: { type: Boolean, default: false },
    status: { type: String, enum: POST_STATUSES, default: 'draft', index: true },
    author: {
      name: { type: String, default: 'Local Creator Crew Team', trim: true },
      role: { type: String, default: '', trim: true },
    },
    // Incremented on each public read (best-effort, for monitoring).
    views: { type: Number, default: 0 },
    // Set when first published; preserved across edits/re-publishes.
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Efficient published-list query (newest first).
postSchema.index({ status: 1, publishedAt: -1 });

export type PostSchemaType = InferSchemaType<typeof postSchema>;

/** A lean/hydrated post document. */
export type PostDoc = PostSchemaType & { _id: unknown };

export const Post: Model<PostSchemaType> =
  (models.Post as Model<PostSchemaType>) ?? model<PostSchemaType>('Post', postSchema);
