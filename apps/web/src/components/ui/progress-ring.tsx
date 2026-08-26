'use client';

interface ProgressRingProps {
  percent: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string; // Hex-Farbe; faellt auf semantische Farbe zurueck wenn nicht gesetzt
  label?: string;
  sublabel?: string;
  isDeficit?: boolean;
}

/**
 * Radialer Fortschrittsring - das Signatur-Element der Plattform ("Lernkompass").
 * Farbe traegt Information: rot = Defizit (<75%), gruen = bestanden, sonst Fachfarbe.
 */
export function ProgressRing({
  percent,
  size = 88,
  strokeWidth = 8,
  color,
  label,
  sublabel,
  isDeficit,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  const ringColor = isDeficit ? '#E4572E' : clamped >= 75 ? '#0F9D78' : (color ?? '#2D3A8C');

  return (
    <div className="relative inline-flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-border dark:text-border-dark"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={
            {
              '--ring-start': circumference,
              '--ring-end': offset,
            } as React.CSSProperties
          }
          className="animate-ring-fill"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono font-bold text-lg text-ink dark:text-ink-dark">
          {Math.round(clamped)}%
        </span>
      </div>
      {label && (
        <span className="mt-2 text-sm font-medium text-ink dark:text-ink-dark text-center">
          {label}
        </span>
      )}
      {sublabel && <span className="text-xs text-muted text-center">{sublabel}</span>}
    </div>
  );
}
