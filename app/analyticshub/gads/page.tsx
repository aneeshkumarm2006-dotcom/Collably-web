'use client';
/** Google Ads source page. */
import { SourceView } from '@/components/analyticshub/source-view';

export default function GadsPage() {
  return (
    <SourceView
      source="gads"
      title="Google Ads"
      description="Google Ads — cost, clicks, impressions, and conversions."
      emptyMessage="Connect Google Ads to see campaign performance here."
    />
  );
}
