'use client';
/** Settings — connect sources, project identity, change password. */
import { Suspense } from 'react';
import { SettingsView } from '@/components/analyticshub/settings-view';

export default function SettingsPage() {
  // SettingsView reads useSearchParams (OAuth result) → needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <SettingsView />
    </Suspense>
  );
}
