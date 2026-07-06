'use client';
/**
 * Hub context: the single source of truth every routed page reads.
 *
 * Holds the loaded status, the selected date range (preset persisted to
 * localStorage), a manual refresh() that busts the API cache, the "last
 * updated" timestamp, and a monotonically-increasing refreshKey pages depend
 * on. `useHubQuery` wraps the common fetch lifecycle (current + previous range,
 * loading/error, cache-bust on manual refresh, abort on unmount).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { HubStatus } from '@/lib/analyticshub/types';
import {
  HubError,
  type Preset,
  type Range,
  previousRange,
  rangeFromPreset,
} from './api';

const PRESET_KEY = 'ahub:preset';

export interface HubContextValue {
  status: HubStatus;
  range: Range & { preset: Preset };
  setRange: (preset: Preset) => void;
  refresh: () => void;
  reloadStatus: () => Promise<void>;
  lastUpdated: Date | null;
  refreshKey: number;
  refreshing: boolean;
}

const HubContext = createContext<HubContextValue | null>(null);

export function useHub(): HubContextValue {
  const ctx = useContext(HubContext);
  if (!ctx) throw new Error('useHub must be used within <HubProvider>');
  return ctx;
}

function readPreset(): Preset {
  if (typeof window === 'undefined') return '7d';
  const v = window.localStorage.getItem(PRESET_KEY);
  if (v === 'today' || v === 'yesterday' || v === '7d' || v === '28d' || v === '90d') return v;
  return '7d';
}

export function HubProvider({
  status,
  reloadStatus,
  children,
}: {
  status: HubStatus;
  reloadStatus: () => Promise<void>;
  children: React.ReactNode;
}) {
  const [preset, setPreset] = useState<Preset>('7d');
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Hydrate persisted preset on mount (avoids SSR/client mismatch).
  useEffect(() => {
    setPreset(readPreset());
  }, []);

  const setRange = useCallback((next: Preset) => {
    setPreset(next);
    try {
      window.localStorage.setItem(PRESET_KEY, next);
    } catch {
      /* storage unavailable — non-fatal */
    }
  }, []);

  const refresh = useCallback(() => {
    setRefreshing(true);
    setRefreshKey((k) => k + 1);
  }, []);

  const range = useMemo(() => ({ ...rangeFromPreset(preset), preset }), [preset]);

  const value = useMemo<HubContextValue>(
    () => ({
      status,
      range,
      setRange,
      refresh,
      reloadStatus,
      lastUpdated,
      refreshKey,
      refreshing,
    }),
    [status, range, setRange, refresh, reloadStatus, lastUpdated, refreshKey, refreshing],
  );

  return (
    <HubContext.Provider value={value}>
      <RefreshBridge
        refreshKey={refreshKey}
        onSettled={() => {
          setLastUpdated(new Date());
          setRefreshing(false);
        }}
      />
      {children}
    </HubContext.Provider>
  );
}

/**
 * Marks "last updated" + clears the refreshing flag shortly after a refresh
 * fires. Pages report completion implicitly; this keeps the TopBar honest
 * without threading a per-page callback through context.
 */
function RefreshBridge({ refreshKey, onSettled }: { refreshKey: number; onSettled: () => void }) {
  useEffect(() => {
    const t = setTimeout(onSettled, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);
  return null;
}

export interface HubQueryArgs {
  current: Range;
  previous: Range;
  refresh: boolean;
  signal: AbortSignal;
}

export interface HubQueryState<T> {
  data: T | null;
  previous: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Runs a fetch keyed on the active range + refreshKey. `run` receives the
 * current range, the equal-length previous range, whether to bust cache, and an
 * abort signal. Returns both current + previous payloads for delta math.
 */
export function useHubQuery<T>(
  run: (args: HubQueryArgs) => Promise<{ current: T; previous: T }>,
): HubQueryState<T> {
  const { range, refreshKey } = useHub();
  const [state, setState] = useState<HubQueryState<T>>({
    data: null,
    previous: null,
    loading: true,
    error: null,
  });
  const lastKey = useRef(refreshKey);

  useEffect(() => {
    const controller = new AbortController();
    const bust = refreshKey !== lastKey.current && refreshKey !== 0;
    lastKey.current = refreshKey;
    setState((s) => ({ ...s, loading: true, error: null }));

    const current: Range = { from: range.from, to: range.to };
    const previous = previousRange(current);

    run({ current, previous, refresh: bust, signal: controller.signal })
      .then(({ current: cur, previous: prev }) => {
        if (controller.signal.aborted) return;
        setState({ data: cur, previous: prev, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted || (err as Error)?.name === 'AbortError') return;
        const msg = err instanceof HubError ? err.message : 'Something went wrong loading data.';
        setState({ data: null, previous: null, loading: false, error: msg });
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.from, range.to, refreshKey]);

  return state;
}
