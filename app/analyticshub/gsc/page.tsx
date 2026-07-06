'use client';
/** Google Search Console source page. */
import { SourceView } from '@/components/analyticshub/source-view';

export default function GscPage() {
  return (
    <SourceView
      source="gsc"
      title="Search Console"
      description="Google Search Console — clicks, impressions, CTR, and position."
      emptyMessage="Connect Google Search Console to see search performance here."
    />
  );
}
