'use client';
/**
 * WYSIWYG body editor (Tiptap). Gives non-technical authors headings, bold,
 * lists, quotes, links and images without touching markup. Paste from Google
 * Docs/Word is cleaned by Tiptap's schema (unknown tags/styles are dropped).
 * Inline images upload through the SEO-session-gated Cloudinary signer.
 */
import { useEffect, useRef } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  ImagePlus,
  Undo,
  Redo,
} from 'lucide-react';
import { proseClass } from '@/components/marketing/prose';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';
import { uploadSeoImage } from '@/lib/seoteam/upload-client';

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-secondary hover:text-ink [&_svg]:h-4 [&_svg]:w-4',
        active && 'bg-brand-soft text-brand',
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const toastId = toast.loading('Uploading image…');
    try {
      const url = await uploadSeoImage(file);
      editor.chain().focus().setImage({ src: url }).run();
      toast.success('Image added', { id: toastId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed', { id: toastId });
    }
  }

  function addLink() {
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL', prev ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-hair bg-page px-2 py-1.5">
      <ToolbarButton title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold />
      </ToolbarButton>
      <ToolbarButton title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-hair" />
      <ToolbarButton title="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 />
      </ToolbarButton>
      <ToolbarButton title="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-hair" />
      <ToolbarButton title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List />
      </ToolbarButton>
      <ToolbarButton title="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered />
      </ToolbarButton>
      <ToolbarButton title="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-hair" />
      <ToolbarButton title="Link" active={editor.isActive('link')} onClick={addLink}>
        <Link2 />
      </ToolbarButton>
      <ToolbarButton title="Image" onClick={() => fileRef.current?.click()}>
        <ImagePlus />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-hair" />
      <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()}>
        <Undo />
      </ToolbarButton>
      <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()}>
        <Redo />
      </ToolbarButton>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickImage} />
    </div>
  );
}

export function TiptapEditor({
  value,
  onChange,
  loadHtml,
}: {
  value: string;
  /** Called with sanitizable HTML whenever the doc changes. */
  onChange: (html: string) => void;
  /** A monotonically increasing signal + html to replace the doc (template picker). */
  loadHtml?: { html: string; token: number };
}) {
  const editor = useEditor({
    immediatelyRender: false, // avoid SSR hydration mismatch in Next
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener' } }),
      Image.configure({ HTMLAttributes: { class: 'rounded-xl' } }),
      Placeholder.configure({ placeholder: 'Write or paste your post content here…' }),
    ],
    content: value || '',
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
  });

  // Replace the doc when a template is picked (token changes).
  const lastToken = useRef<number>(-1);
  useEffect(() => {
    if (!editor || !loadHtml) return;
    if (loadHtml.token !== lastToken.current) {
      lastToken.current = loadHtml.token;
      editor.commands.setContent(loadHtml.html || '');
      onChange(editor.getHTML());
    }
  }, [editor, loadHtml, onChange]);

  if (!editor) {
    return <div className="h-64 animate-pulse rounded-b-xl bg-secondary" />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-hair bg-card">
      <Toolbar editor={editor} />
      <EditorContent
        editor={editor}
        className={cn(
          proseClass,
          'min-h-[360px] px-5 py-4 focus:outline-none [&_.ProseMirror]:min-h-[340px] [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-faint [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
        )}
      />
    </div>
  );
}
