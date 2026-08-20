/**
 * Anel de score (0–100) — réplica do componente SVG das telas do Stitch.
 * `selected` usa a variação coral do card destacado.
 */
export function ScoreRing({
  score,
  selected = false,
  size = 48,
}: {
  score: number;
  selected?: boolean;
  size?: number;
}) {
  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      aria-label={`Compatibilidade ${score}%`}
    >
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke={selected ? '#e0c0b6' : '#F5F5F7'}
          strokeWidth="3"
        />
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="#D85A30"
          strokeDasharray={`${score}, 100`}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <span
        className={`absolute text-label-md font-semibold ${selected ? 'text-coral' : 'text-on-surface'}`}
      >
        {score}
      </span>
    </div>
  );
}
