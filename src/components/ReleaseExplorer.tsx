"use client";

import { useMemo, useState } from "react";
import GameCard from "./GameCard";
import { GENRES, PLATFORMS, type RawgGame, type ReleaseWindow } from "@/lib/rawg";

const WINDOWS: { value: ReleaseWindow; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
];

const CHIP =
  "rounded-full border px-3 py-1.5 text-sm font-medium transition-all";
const CHIP_OFF = "border-line bg-card text-stone-600 hover:border-stone-400 hover:text-ink";
const CHIP_ON = "border-ink bg-ink text-white";

const PAGE_SIZE = 40;

export default function ReleaseExplorer({
  initialGames,
}: {
  initialGames: Record<ReleaseWindow, RawgGame[]>;
}) {
  const [window, setWindow] = useState<ReleaseWindow>("week");
  const [platforms, setPlatforms] = useState<number[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const pool = initialGames[window] ?? [];
    return pool.filter((g) => {
      if (platforms.length > 0) {
        const ids = g.platforms.map((p) => p.platform.id);
        if (!platforms.some((id) => ids.includes(id))) return false;
      }
      if (genres.length > 0) {
        const slugs = g.genres.map((gen) => gen.slug);
        if (!genres.some((slug) => slugs.includes(slug))) return false;
      }
      return true;
    });
  }, [initialGames, window, platforms, genres]);

  const resetFilters = () => {
    setPlatforms([]);
    setGenres([]);
    setVisible(PAGE_SIZE);
  };

  const selectWindow = (w: ReleaseWindow) => {
    setWindow(w);
    setVisible(PAGE_SIZE);
  };

  const toggle = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const togglePlatform = (id: number) => {
    setPlatforms(toggle(platforms, id));
    setVisible(PAGE_SIZE);
  };

  const toggleGenre = (slug: string) => {
    setGenres(toggle(genres, slug));
    setVisible(PAGE_SIZE);
  };

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  return (
    <div>
      <div className="rounded-2xl border border-line bg-card p-5 sm:p-6">
        {/* Window selector */}
        <div className="flex w-fit rounded-full border border-line bg-stone-100 p-1">
          {WINDOWS.map((w) => (
            <button
              key={w.value}
              onClick={() => selectWindow(w.value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                window === w.value
                  ? "bg-card text-ink shadow-sm"
                  : "text-stone-500 hover:text-ink"
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-5">
          {/* Platform filters */}
          <div>
            <p className="mb-2.5 text-[11px] font-bold tracking-[0.14em] text-stone-400 uppercase">
              Platforms
            </p>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => {
                const active = platforms.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    className={`${CHIP} ${active ? CHIP_ON : CHIP_OFF}`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Genre filters */}
          <div>
            <p className="mb-2.5 text-[11px] font-bold tracking-[0.14em] text-stone-400 uppercase">
              Genres
            </p>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((g) => {
                const active = genres.includes(g.slug);
                return (
                  <button
                    key={g.slug}
                    onClick={() => toggleGenre(g.slug)}
                    className={`${CHIP} ${active ? CHIP_ON : CHIP_OFF}`}
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>
          </div>

          {(platforms.length > 0 || genres.length > 0) && (
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-orange-600 underline decoration-orange-300 underline-offset-2 hover:text-orange-500"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="mt-8">
        {shown.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-card p-12 text-center">
            <p className="text-3xl">🛌</p>
            <p className="mt-3 font-display text-base font-bold text-ink">
              Nothing in this window with those filters.
            </p>
            <p className="mt-1 text-sm text-stone-500">
              Either the industry took a nap or your filters are too picky.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>

            <div className="mt-10 flex flex-col items-center gap-3">
              <p className="text-sm text-stone-500">
                {filtered.length} game{filtered.length === 1 ? "" : "s"} in this
                window
                {platforms.length > 0 || genres.length > 0 ? " with these filters" : ""}
              </p>
              {hasMore && (
                <button
                  onClick={() => setVisible(visible + PAGE_SIZE)}
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3 text-sm font-semibold text-white transition-all hover:bg-stone-800 hover:shadow-lg hover:shadow-stone-900/15"
                >
                  Load more games ↓
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}