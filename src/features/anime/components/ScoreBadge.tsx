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
      className={`rounded-tl-md px-2 py-1 text-2xl leading-tight tabular-nums ${tones[getScoreTone(score)]}`}
      aria-label={
        score === null ? "Nota indisponível" : `Nota média: ${score}%`
      }
    >
      {score === null ? "—" : `${score}%`}
    </span>
  );
}
