/**
 * Ready-made SEO post templates. Picking one loads a heading structure +
 * placeholder guidance into the editor so a non-technical author starts from a
 * proven shape instead of a blank page. Pure data — safe to import on the client.
 */
import type { PostTemplateId } from '@/lib/db/post-constants';

export interface PostTemplate {
  id: PostTemplateId;
  label: string;
  description: string;
  /** Starter body HTML loaded into the WYSIWYG editor. */
  html: string;
}

export const POST_TEMPLATES: PostTemplate[] = [
  {
    id: 'how-to',
    label: 'How-To / Tutorial',
    description: 'Step-by-step guide that ranks for "how to …" searches.',
    html: `<p>Briefly explain what the reader will achieve and why it matters.</p>
<h2>What you'll need</h2>
<ul><li>Prerequisite or tool 1</li><li>Prerequisite or tool 2</li></ul>
<h2>Step 1: Do the first thing</h2>
<p>Explain the first step clearly.</p>
<h2>Step 2: Do the next thing</h2>
<p>Explain the next step.</p>
<h2>Step 3: Finish up</h2>
<p>Wrap up the final step.</p>
<h2>Conclusion</h2>
<p>Summarize and add a call to action.</p>`,
  },
  {
    id: 'listicle',
    label: 'Listicle (Top N …)',
    description: 'Numbered list post, e.g. "Top 10 …".',
    html: `<p>Introduce the list and what makes it worth reading.</p>
<h2>1. First item</h2>
<p>Why this item earns its spot.</p>
<h2>2. Second item</h2>
<p>Why this item earns its spot.</p>
<h2>3. Third item</h2>
<p>Why this item earns its spot.</p>
<h2>Final thoughts</h2>
<p>Recap and a closing call to action.</p>`,
  },
  {
    id: 'comparison',
    label: 'Comparison / "X vs Y"',
    description: 'Head-to-head comparison to capture "X vs Y" searches.',
    html: `<p>Set up the comparison and who each option suits.</p>
<h2>Overview</h2>
<p>Quick summary of both options.</p>
<h2>X: strengths and weaknesses</h2>
<p>Where X wins and where it falls short.</p>
<h2>Y: strengths and weaknesses</h2>
<p>Where Y wins and where it falls short.</p>
<h2>Which should you choose?</h2>
<p>Give a clear recommendation by use case.</p>`,
  },
  {
    id: 'review',
    label: 'Product / Service Review',
    description: 'In-depth review with a verdict.',
    html: `<p>Introduce the product/service and your overall take.</p>
<h2>What it is</h2>
<p>Describe what it does and who it's for.</p>
<h2>What we liked</h2>
<ul><li>Pro 1</li><li>Pro 2</li></ul>
<h2>What could be better</h2>
<ul><li>Con 1</li><li>Con 2</li></ul>
<h2>Verdict</h2>
<p>Your final rating and recommendation.</p>`,
  },
  {
    id: 'news',
    label: 'News / Update',
    description: 'Timely announcement or industry update.',
    html: `<p><strong>The news in one sentence.</strong></p>
<h2>What happened</h2>
<p>The key facts.</p>
<h2>Why it matters</h2>
<p>The impact for your readers.</p>
<h2>What's next</h2>
<p>What to watch for and any action to take.</p>`,
  },
  {
    id: 'generic',
    label: 'Generic Article',
    description: 'A flexible article structure for anything else.',
    html: `<p>Open with a hook that states the topic and value.</p>
<h2>Section heading</h2>
<p>Body paragraph.</p>
<h2>Another section</h2>
<p>Body paragraph.</p>
<h2>Conclusion</h2>
<p>Summarize and add a call to action.</p>`,
  },
];

export function getTemplate(id: string): PostTemplate | undefined {
  return POST_TEMPLATES.find((t) => t.id === id);
}
