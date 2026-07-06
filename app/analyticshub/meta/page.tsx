'use client';
/** Meta Ads source page. */
import { SourceView } from '@/components/analyticshub/source-view';

export default function MetaPage() {
  return (
    <SourceView
      source="meta"
      title="Meta Ads"
      description="Meta advertising — spend, reach, clicks, and conversions."
      emptyMessage="Connect a Meta ad account to see ad performance here."
    />
  );
}
