interface CompletionRateProps {
  value: number;
  size?: number;
}

export function CompletionRate({ value, size = 96 }: CompletionRateProps) {
  const pct = Math.min(100, Math.max(0, value));
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div
      className="relative inline-flex items-center justify-center drop-shadow-[0_0_12px_rgba(132,255,0,0.15)]"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={6}
          stroke="var(--border)"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={7}
          stroke="var(--primary, #84ff00)"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: 'stroke-dashoffset var(--d-slow, 560ms) var(--e-out, cubic-bezier(0.16, 1, 0.3, 1))',
            filter: 'drop-shadow(0 0 6px rgba(132,255,0,0.3))',
          }}
        />
      </svg>
      <span className="absolute text-lg font-bold tracking-tight font-mono">
        {Math.round(pct)}%
      </span>
    </div>
  );
}
