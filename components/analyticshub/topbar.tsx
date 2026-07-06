'use client';
/**
 * Top bar: date-range preset picker (persisted, default Last 7 days), a Refresh
 * button that busts the API cache (?refresh=1), a "last updated" stamp, and
 * Sign out. Reads/drives everything through the hub context.
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { useHub } from './context';
import { PRESETS, type Preset, postLogout } from './api';

export function TopBar() {
  const { range, setRange, refresh, refreshing, lastUpdated } = useHub();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await postLogout();
      router.push('/analyticshub');
      router.refresh();
      window.location.reload();
    } catch {
      toast.error('Could not sign out. Try again.');
      setSigningOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-hair bg-card/90 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <Select value={range.preset} onValueChange={(v) => setRange(v as Preset)}>
          <SelectTrigger className="h-9 w-[168px]" aria-label="Date range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRESETS.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="hidden font-mono text-xs text-faint sm:inline">
          {range.from} → {range.to}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {lastUpdated && (
          <span className="hidden text-xs text-faint md:inline">
            Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={refreshing}
          aria-label="Refresh data"
        >
          <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={signOut} disabled={signingOut}>
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </div>
    </header>
  );
}
