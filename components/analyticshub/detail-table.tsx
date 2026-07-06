'use client';
/** Renders a source's top-N detail table. Tabular numerals, horizontal scroll. */
import type { DetailTable as DetailTableType } from '@/lib/analyticshub/types';

export function DetailTable({ table }: { table: DetailTableType }) {
  const columns = table.columns ?? [];
  const rows = table.rows ?? [];
  return (
    <section className="rounded-xl border border-hair bg-card shadow-card">
      <header className="border-b border-hair px-4 py-3">
        <h3 className="font-display text-sm font-bold text-ink">{table.title}</h3>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="border-b border-hair">
              {columns.map((c, i) => (
                <th
                  key={i}
                  className={`px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-faint ${
                    i === 0 ? 'text-left' : 'text-right'
                  }`}
                  scope="col"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={Math.max(1, columns.length)} className="px-4 py-6 text-center text-muted">
                  No rows for this range.
                </td>
              </tr>
            ) : (
              rows.map((row, ri) => (
                <tr key={ri} className="border-b border-hair last:border-0 hover:bg-secondary/50">
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={`px-4 py-2.5 ${
                        ci === 0
                          ? 'text-left font-medium text-ink'
                          : 'text-right font-mono tabular-nums text-muted'
                      }`}
                    >
                      {formatCell(cell)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function formatCell(cell: string | number): string {
  if (typeof cell === 'number') return new Intl.NumberFormat('en-US').format(cell);
  return String(cell);
}
