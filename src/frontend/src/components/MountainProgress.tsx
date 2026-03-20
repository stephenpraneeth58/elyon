interface MountainProgressProps {
  completed: number;
  total: number;
}

export default function MountainProgress({
  completed,
  total,
}: MountainProgressProps) {
  const pct = total > 0 ? completed / total : 0;
  const glowOpacity = 0.2 + pct * 0.8;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-48 h-32">
        <svg viewBox="0 0 200 130" className="w-full h-full" aria-hidden="true">
          {/* Sky glow behind peak */}
          {pct > 0 && (
            <ellipse
              cx="100"
              cy="20"
              rx={30 * pct}
              ry={15 * pct}
              fill="oklch(0.76 0.18 76)"
              opacity={glowOpacity * 0.4}
            />
          )}
          {/* Mountain body */}
          <path
            d="M20 120 L100 15 L180 120 Z"
            fill="oklch(0.18 0 0)"
            stroke="oklch(0.26 0 0)"
            strokeWidth="1"
          />
          {/* Left ridge detail */}
          <path
            d="M20 120 L60 70 L100 15"
            fill="none"
            stroke="oklch(0.22 0 0)"
            strokeWidth="1"
          />
          {/* Snow cap - gold tinted based on completion */}
          <path
            d="M100 15 L83 48 L117 48 Z"
            fill={`oklch(0.76 ${0.05 + pct * 0.13} 76)`}
            opacity={0.3 + pct * 0.7}
          />
          {/* Peak glow point */}
          <circle
            cx="100"
            cy="15"
            r={3 + pct * 4}
            fill="oklch(0.76 0.18 76)"
            opacity={pct > 0 ? 0.9 : 0.2}
          />
          {/* Progress fill on mountain side */}
          {pct > 0 && (
            <path
              d={`M100 15 L83 48 L${83 + 34 * pct} 48 Z`}
              fill="oklch(0.76 0.18 76)"
              opacity={0.5 * pct}
            />
          )}
        </svg>
      </div>
      <p className="text-sm text-muted-foreground">
        <span className="text-gold font-semibold">{completed}</span>
        <span className="text-muted-foreground">
          {" "}
          of {total} tasks done today
        </span>
      </p>
    </div>
  );
}
