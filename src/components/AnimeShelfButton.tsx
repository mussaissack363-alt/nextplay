"use client";

import { useAnimeShelf } from "@/hooks/useAnimeShelf";
import {
  ANIME_STATUS_LABELS,
  ANIME_STATUS_ORDER,
  type AnimeShelfItem,
  type AnimeStatus,
} from "@/lib/anime-shelf";

const ACTIVE_STYLES: Record<AnimeStatus, string> = {
  watching: "border-emerald-600 bg-emerald-600 text-white",
  planned: "border-sky-600 bg-sky-600 text-white",
  completed: "border-stone-900 bg-stone-900 text-white",
  dropped: "border-rose-600 bg-rose-600 text-white",
};

export default function AnimeShelfButton({ anime }: { anime: AnimeShelfItem }) {
  const { entries, add } = useAnimeShelf();
  const entry = entries.find((e) => e.id === anime.id);

  return (
    <div className="flex flex-wrap gap-1.5">
      {ANIME_STATUS_ORDER.map((status) => {
        const active = entry?.status === status;
        return (
          <button
            key={status}
            onClick={() => add(anime, status)}
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition-all ${
              active
                ? ACTIVE_STYLES[status]
                : "border-line bg-white text-stone-600 hover:border-stone-400 hover:text-ink"
            }`}
          >
            {ANIME_STATUS_LABELS[status]}
          </button>
        );
      })}
    </div>
  );
}