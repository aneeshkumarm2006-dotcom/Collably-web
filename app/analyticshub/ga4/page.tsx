'use client';
/** Google Analytics (GA4) source page. */
import { SourceView } from '@/components/analyticshub/source-view';

export default function Ga4Page() {
  return (
    <SourceView
      source="ga4"
      title="Analytics"
      description="Google Analytics 4 — traffic, engagement, and key events."
      emptyMessage="Connect Google Analytics to see sessions, users, and key events here."
    />
  );
}
