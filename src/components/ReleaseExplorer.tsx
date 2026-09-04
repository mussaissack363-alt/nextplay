"use client";

import { useEffect, useState } from "react";
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
  initialGames: RawgGame[];
}) {
  const [window, setWindow] = useState<ReleaseWindow>("week");
  const [platforms, setPlatforms] = useState<number[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [games, setGames] = useState<RawgGame[]>(initialGames);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialGames.length >= PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  const buildParams = (pageNum: number) => {
    const params = new URLSearchParams({ window, page: String(pageNum) });
    if (platforms.length > 0) params.set("platforms", platforms.join(","));
    if (genres.length > 0) params.set("genres", genres.join(","));
    return params;
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    fetch(`/api/releases?${buildParams(1).toString()}`)
      .then((res) => res.json())
      .then((data: { games?: RawgGame[]; hasMore?: boolean }) => {
        if (cancelled) return;
        setGames(data.games ?? []);
        setPage(1);
        setHasMore(data.hasMore ?? false);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [window, platforms, genres]);

  const loadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const next = page + 1;
    try {
      const res = await fetch(`/api/releases?${buildParams(next).toString()}`);
      const data = (await res.json()) as {
        games?: RawgGame[];
        hasMore?: boolean;
      };
      const batch = data.games ?? [];
      // Avoid duplicate ids when the data shifts between pages.
      setGames((prev) => {
        const seen = new Set(prev.map((g) => g.id));
        return [...prev, ...batch.filter((g) => !seen.has(g.id))];
      });
      setPage(next);
      setHasMore(data.hasMore ?? false);
    } catch {
      // Ran past the last page — stop offering load more.
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  const toggle = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  return (
    <div>
      <div className="rounded-2xl border border-line bg-card p-5 sm:p-6">
        {/* Window selector */}
        <div className="flex w-fit rounded-full border border-line bg-stone-100 p-1">
          {WINDOWS.map((w) => (
            <button
              key={w.value}
              onClick={() => setWindow(w.value)}
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
                    onClick={() => setPlatforms(toggle(platforms, p.id))}
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
                    onClick={() => setGenres(toggle(genres, g.slug))}
                    className={`${CHIP} ${active ? CHIP_ON : CHIP_OFF}`}
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mt-8">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-2xl border border-line bg-stone-200/60"
              />
            ))}
          </div>
        ) : error ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
            Couldn&apos;t reach the game database. Try again in a minute.
          </p>
        ) : games.length === 0 ? (
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
              {games.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>

            <div className="mt-10 flex flex-col items-center gap-3">
              <p className="text-sm text-stone-500">
                {games.length} game{games.length === 1 ? "" : "s"} shown
              </p>
              {hasMore && (
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3 text-sm font-semibold text-white transition-all hover:bg-stone-800 hover:shadow-lg hover:shadow-stone-900/15 disabled:opacity-60"
                >
                  {loadingMore ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Loading more…
                    </>
                  ) : (
                    <>Load more games ↓</>
                  )}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
