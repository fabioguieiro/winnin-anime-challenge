import { getScoreTone } from "../model/anime";

const tones = {
  low: "bg-score-low text-white",
  medium: "bg-score-medium text-neutral-950",
  high: "bg-score-high text-white",
  unavailable: "bg-neutral-700 text-white",
};

export function ScoreBadge({ score }: { score: number | null }) {
  return (
    <span
      className={`inline-flex min-h-9 items-center rounded-sm px-2 py-1 text-2xl leading-7 font-light tabular-nums ${tones[getScoreTone(score)]}`}
      aria-label={
        score === null ? "Score unavailable" : `Average score: ${score}%`
      }
    >
      {score === null ? "—" : `${score}%`}
    </span>
  );
}
