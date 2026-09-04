"use client";

import { useMemo, useState } from "react";
import AnimeCard from "./AnimeCard";
import { airStatus, type Anime } from "@/lib/anime";

const CHIP = "rounded-full border px-3 py-1.5 text-sm font-medium transition-all";
const CHIP_OFF = "border-line bg-card text-stone-600 hover:border-stone-400 hover:text-ink";
const CHIP_ON = "border-ink bg-ink text-white";

type StatusFilter = "all" | "airing" | "finished" | "upcoming";
type TypeFilter = "all" | "tv" | "movie" | "ova" | "special";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "airing", label: "Airing now" },
  { value: "finished", label: "Finished" },
  { value: "upcoming", label: "Upcoming" },
];

const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "tv", label: "TV" },
  { value: "movie", label: "Movie" },
  { value: "ova", label: "OVA" },
  { value: "special", label: "Special" },
];

export default function AnimeExplorer({ initialAnime }: { initialAnime: Anime[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [type, setType] = useState<TypeFilter>("all");
  const [genres, setGenres] = useState<string[]>([]);

  const genreOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of initialAnime) {
      for (const g of a.genres) {
        counts.set(g.name, (counts.get(g.name) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 14)
      .map(([name]) => name);
  }, [initialAnime]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialAnime.filter((a) => {
      if (q && !a.title.toLowerCase().includes(q) && !(a.title_english ?? "").toLowerCase().includes(q)) {
        return false;
      }
      if (status !== "all" && airStatus(a) !== status) return false;
      if (type !== "all") {
        const t = (a.type ?? "").toLowerCase();
        if (type === "ova" && !t.includes("ova") && !t.includes("ona")) return false;
        if (type !== "ova" && t !== type) return false;
      }
      if (genres.length > 0) {
        const names = new Set(a.genres.map((g) => g.name));
        if (!genres.every((g) => names.has(g))) return false;
      }
      return true;
    });
  }, [initialAnime, query, status, type, genres]);

  const toggle = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  return (
    <div>
      <div className="rounded-2xl border border-line bg-card p-5 sm:p-6">
        {/* Search */}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search this season… (e.g. One Piece, Frieren)"
          className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink placeholder:text-stone-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 focus:outline-none"
        />

        <div className="mt-5 space-y-5">
          {/* Status */}
          <div>
            <p className="mb-2.5 text-[11px] font-bold tracking-[0.14em] text-stone-400 uppercase">
              Status
            </p>
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatus(f.value)}
                  className={`${CHIP} ${status === f.value ? CHIP_ON : CHIP_OFF}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div>
            <p className="mb-2.5 text-[11px] font-bold tracking-[0.14em] text-stone-400 uppercase">
              Type
            </p>
            <div className="flex flex-wrap gap-2">
              {TYPE_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setType(f.value)}
                  className={`${CHIP} ${type === f.value ? CHIP_ON : CHIP_OFF}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Genres */}
          {genreOptions.length > 0 && (
            <div>
              <p className="mb-2.5 text-[11px] font-bold tracking-[0.14em] text-stone-400 uppercase">
                Genres
              </p>
              <div className="flex flex-wrap gap-2">
                {genreOptions.map((g) => {
                  const active = genres.includes(g);
                  return (
                    <button
                      key={g}
                      onClick={() => setGenres(toggle(genres, g))}
                      className={`${CHIP} ${active ? CHIP_ON : CHIP_OFF}`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="mt-8">
        <p className="mb-4 text-xs font-semibold text-stone-400">
          {filtered.length} title{filtered.length === 1 ? "" : "s"}
          {query || status !== "all" || type !== "all" || genres.length > 0
            ? " after filtering"
            : " this season"}
        </p>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-card p-12 text-center">
            <p className="text-3xl">🎌</p>
            <p className="mt-3 font-display text-base font-bold text-ink">
              Nothing matches those filters.
            </p>
            <p className="mt-1 text-sm text-stone-500">
              Either the season is quiet or you&apos;re too specific. Loosen a
              chip and try again.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}