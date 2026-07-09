'use client';
/**
 * The full post editor used by both /seoteam/new and /seoteam/[id]/edit. Holds
 * all form state and composes the template picker, meta fields (with live
 * char-count hints), cover + inline image upload, the Tiptap body, the keyword
 * backlink manager, and the live SEO check panel. Saves via /api/seoteam/posts.
 */
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import NextImage from 'next/image';
import { ImagePlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { uploadSeoImage } from '@/lib/seoteam/upload-client';
import { META_TITLE_RANGE, META_DESC_RANGE } from '@/lib/seoteam/seo-checks';
import { getTemplate } from '@/lib/seoteam/templates';
import type { PostTemplateId } from '@/lib/db/post-constants';
import type { KeywordEntry } from '@/lib/seoteam/keyword-links';
import { TemplatePicker } from './template-picker';
import { TiptapEditor } from './tiptap-editor';
import { KeywordManager } from './keyword-manager';
import { SeoCheckPanel } from './seo-check-panel';

/** Client-safe slugify (mirrors the server helper; server re-slugs on save). */
function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export interface EditorInitial {
  id?: string;
  title: string;
  slug: string;
  template: PostTemplateId;
  body: string;
  excerpt: string;
  metaTitle: string;
  category: string;
  tags: string[];
  coverImage: string;
  keywords: KeywordEntry[];
  linkAllOccurrences: boolean;
  authorName: string;
  authorRole: string;
  status: 'draft' | 'published';
}

const EMPTY: EditorInitial = {
  title: '',
  slug: '',
  template: 'generic',
  body: '',
  excerpt: '',
  metaTitle: '',
  category: 'Guides',
  tags: [],
  coverImage: '',
  keywords: [],
  linkAllOccurrences: false,
  authorName: 'LocalShout Team',
  authorRole: '',
  status: 'draft',
};

function CharHint({ len, min, max }: { len: number; min: number; max: number }) {
  const ok = len >= min && len <= max;
  return (
    <span className={cn('text-[12px] font-medium', ok ? 'text-money' : 'text-warn')}>
      {len} / {min}–{max}
    </span>
  );
}

export function PostEditor({ initial }: { initial?: EditorInitial }) {
  const router = useRouter();
  const [state, setState] = useState<EditorInitial>(initial ?? EMPTY);
  const [slugEdited, setSlugEdited] = useState(Boolean(initial?.slug));
  const [loadHtml, setLoadHtml] = useState<{ html: string; token: number } | undefined>(undefined);
  const [saving, setSaving] = useState<false | 'draft' | 'published'>(false);
  const [coverBusy, setCoverBusy] = useState(false);
  const [dirty, setDirty] = useState(false);

  const isEdit = Boolean(initial?.id);

  // Warn before losing unsaved edits on reload / tab close / hard navigation.
  // (SPA route changes aren't covered by beforeunload; this catches the common
  // accidental-close/refresh case.)
  useEffect(() => {
    if (!dirty || saving) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty, saving]);

  function set<K extends keyof EditorInitial>(key: K, value: EditorInitial[K]) {
    setDirty(true);
    setState((s) => ({ ...s, [key]: value }));
  }

  function onTitleChange(title: string) {
    setDirty(true);
    setState((s) => ({
      ...s,
      title,
      slug: slugEdited ? s.slug : slugify(title),
    }));
  }

  function onPickTemplate(id: PostTemplateId) {
    const tpl = getTemplate(id);
    if (!tpl) return;
    const hasBody = state.body.replace(/<[^>]*>/g, '').trim().length > 0;
    if (hasBody && !window.confirm('Replace the current content with this template?')) return;
    set('template', id);
    setLoadHtml({ html: tpl.html, token: Date.now() });
  }

  async function onCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setCoverBusy(true);
    try {
      const url = await uploadSeoImage(file, 'blog/covers');
      set('coverImage', url);
      toast.success('Cover image set');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setCoverBusy(false);
    }
  }

  const seoInput = useMemo(
    () => ({
      metaTitle: state.metaTitle || state.title,
      metaDescription: state.excerpt,
      body: state.body,
      keywords: state.keywords,
      coverImage: state.coverImage,
    }),
    [state],
  );

  async function save(status: 'draft' | 'published') {
    if (!state.title.trim()) {
      toast.error('Add a title first');
      return;
    }
    setSaving(status);
    const payload = {
      title: state.title,
      slug: state.slug || undefined,
      template: state.template,
      body: state.body,
      excerpt: state.excerpt,
      metaTitle: state.metaTitle,
      category: state.category,
      tags: state.tags,
      coverImage: state.coverImage,
      keywords: state.keywords,
      linkAllOccurrences: state.linkAllOccurrences,
      author: { name: state.authorName, role: state.authorRole },
      status,
    };
    try {
      const res = await fetch(
        isEdit ? `/api/seoteam/posts/${initial!.id}` : '/api/seoteam/posts',
        {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(data.message || 'Save failed');
      }
      toast.success(status === 'published' ? 'Published — live on /blog' : 'Draft saved');
      setDirty(false); // saved — drop the unsaved-changes guard before navigating
      router.push('/seoteam');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-ink">
          {isEdit ? 'Edit post' : 'New post'}
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => save('draft')} disabled={Boolean(saving)}>
            {saving === 'draft' && <Loader2 className="h-4 w-4 animate-spin" />} Save draft
          </Button>
          <Button onClick={() => save('published')} disabled={Boolean(saving)}>
            {saving === 'published' && <Loader2 className="h-4 w-4 animate-spin" />} Publish
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Main column */}
        <div className="space-y-6">
          <TemplatePicker selected={state.template} onSelect={onPickTemplate} />

          <div className="rounded-xl border border-hair bg-card p-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={state.title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Your post title"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slug">Slug</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">/blog/</span>
                <Input
                  id="slug"
                  value={state.slug}
                  onChange={(e) => {
                    setSlugEdited(true);
                    set('slug', slugify(e.target.value));
                  }}
                  placeholder="post-slug"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={state.category}
                  onChange={(e) => set('category', e.target.value)}
                  placeholder="Guides"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={state.authorName}
                  onChange={(e) => set('authorName', e.target.value)}
                  placeholder="LocalShout Team"
                />
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <Label>Content</Label>
            <TiptapEditor value={state.body} onChange={(html) => set('body', html)} loadHtml={loadHtml} />
          </div>

          <KeywordManager
            keywords={state.keywords}
            onChange={(k) => set('keywords', k)}
            linkAll={state.linkAllOccurrences}
            onLinkAllChange={(v) => set('linkAllOccurrences', v)}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cover */}
          <div className="rounded-xl border border-hair bg-card p-5">
            <h3 className="mb-3 font-display text-base font-bold text-ink">Cover image</h3>
            {state.coverImage ? (
              <div className="relative mb-3 aspect-[16/9] overflow-hidden rounded-lg bg-secondary">
                <NextImage src={state.coverImage} alt="Cover" fill className="object-cover" sizes="340px" />
              </div>
            ) : (
              <div className="mb-3 flex aspect-[16/9] items-center justify-center rounded-lg border border-dashed border-hair text-faint">
                <ImagePlus className="h-6 w-6" />
              </div>
            )}
            <div className="flex items-center gap-2">
              <label className="inline-flex">
                <input type="file" accept="image/*" className="hidden" onChange={onCover} />
                <span className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-sm border-[1.5px] border-hair-strong bg-card px-3 text-[13px] font-semibold text-ink hover:border-brand">
                  {coverBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                  {state.coverImage ? 'Replace' : 'Upload'}
                </span>
              </label>
              {state.coverImage && (
                <Button variant="ghost" size="sm" onClick={() => set('coverImage', '')}>
                  Remove
                </Button>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="rounded-xl border border-hair bg-card p-5 space-y-4">
            <h3 className="font-display text-base font-bold text-ink">Search appearance</h3>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="metaTitle">Meta title</Label>
                <CharHint
                  len={(state.metaTitle || state.title).length}
                  min={META_TITLE_RANGE.min}
                  max={META_TITLE_RANGE.max}
                />
              </div>
              <Input
                id="metaTitle"
                value={state.metaTitle}
                onChange={(e) => set('metaTitle', e.target.value)}
                placeholder={state.title || 'Defaults to the title'}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="excerpt">Meta description</Label>
                <CharHint len={state.excerpt.length} min={META_DESC_RANGE.min} max={META_DESC_RANGE.max} />
              </div>
              <Textarea
                id="excerpt"
                rows={3}
                value={state.excerpt}
                onChange={(e) => set('excerpt', e.target.value)}
                placeholder="One or two sentences shown in search results and on the blog card."
              />
            </div>
          </div>

          <SeoCheckPanel {...seoInput} />
        </div>
      </div>
    </div>
  );
}
