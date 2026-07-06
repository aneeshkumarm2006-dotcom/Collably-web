'use client';
/** Tiny inline-SVG trend line for KPI cards. No axes, no library. */

export function Sparkline({
  points,
  color,
  width = 104,
  height = 30,
  className,
}: {
  points: number[];
  color: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  const vals = points.length ? points : [0, 0];
  const max = Math.max(...vals, 0);
  const min = Math.min(...vals, 0);
  const span = max - min || 1;
  const pad = 2;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const step = vals.length > 1 ? w / (vals.length - 1) : 0;

  const coords = vals.map((v, i) => {
    const x = pad + i * step;
    const y = pad + h - ((v - min) / span) * h;
    return [x, y] as const;
  });
  const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${(pad + w).toFixed(1)},${(pad + h).toFixed(1)} L${pad.toFixed(1)},${(pad + h).toFixed(1)} Z`;
  const gid = `spark-${Math.abs(hashStr(color + vals.length))}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} stroke="none" />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}
