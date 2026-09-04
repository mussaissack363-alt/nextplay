"use client";

import { useShelf } from "@/hooks/useShelf";
import {
  STATUS_LABELS,
  STATUS_ORDER,
  type ShelfGame,
  type ShelfStatus,
} from "@/lib/shelf";

const ACTIVE_STYLES: Record<ShelfStatus, string> = {
  playing: "border-emerald-600 bg-emerald-600 text-white",
  want: "border-sky-600 bg-sky-600 text-white",
  beaten: "border-stone-900 bg-stone-900 text-white",
  dropped: "border-rose-600 bg-rose-600 text-white",
};

export default function ShelfButton({ game }: { game: ShelfGame }) {
  const { entries, add } = useShelf();
  const entry = entries.find((e) => e.id === game.id);

  return (
    <div className="flex flex-wrap gap-1.5">
      {STATUS_ORDER.map((status) => {
        const active = entry?.status === status;
        return (
          <button
            key={status}
            onClick={() => add(game, status)}
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition-all ${
              active
                ? ACTIVE_STYLES[status]
                : "border-line bg-white text-stone-600 hover:border-stone-400 hover:text-ink"
            }`}
          >
            {STATUS_LABELS[status]}
          </button>
        );
      })}
    </div>
  );
}
