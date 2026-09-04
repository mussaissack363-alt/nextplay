import type { Metadata } from "next";
import Link from "next/link";
import GameCard from "@/components/GameCard";
import SetupBanner from "@/components/SetupBanner";
import {
  fetchAllGames,
  getApiKey,
  monthLabel,
  monthOffset,
  monthWindow,
  platformLabel,
  type RawgGame,
} from "@/lib/rawg";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "New Games This Month — Upcoming Releases Guide",
  description:
    "Every game releasing this month, with release dates, platforms, genres and scores. Plus a preview of next month's biggest launches.",
};

type Counts = Record<string, number>;

function countBy<T>(items: T[], pick: (item: T) => string | null): Counts {
  const counts: Counts = {};
  for (const item of items) {
    const key = pick(item);
    if (key) counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

function topCounts(counts: Counts, n: number): [string, number][] {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

export default async function NewGamesPage() {
  const needsKey = !getApiKey();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const next = monthOffset(year, month, 1);

  let thisMonth: RawgGame[] = [];
  let nextMonth: RawgGame[] = [];

  if (!needsKey) {
    try {
      const w = monthWindow(year, month);
      thisMonth = await fetchAllGames(
        { dates: `${w.start},${w.end}`, ordering: "-released" },
        60,
      );
    } catch {
      thisMonth = [];
    }
    try {
      const w2 = monthWindow(next.year, next.month);
      nextMonth = await fetchAllGames(
        { dates: `${w2.start},${w2.end}`, ordering: "-released" },
        24,
      );
    } catch {
      nextMonth = [];
    }
  }

  const platforms = topCounts(
    countBy(thisMonth, (g) => (g.platforms.length ? platformLabel(g.platforms[0].platform.slug) : null)),
    4,
  );
  const genres = topCounts(
    countBy(thisMonth, (g) => g.genres[0]?.name ?? null),
    5,
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-8 sm:py-16">
      <p className="text-xs font-bold tracking-[0.22em] text-orange-600 uppercase">
        Release Guides
      </p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
        New Games This Month
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-stone-600">
        The complete {monthLabel(year, month).toLowerCase()} release calendar —
        every launch we can find, with dates, platforms, genres and scores, so
        you can plan your wallet before your wallet plans you.
      </p>

      {needsKey ? (
        <div className="mt-10">
          <SetupBanner />
        </div>
      ) : (
        <>
          {/* Counts */}
          <div className="mt-8 flex flex-wrap gap-2">
            {platforms.map(([label, count]) => (
              <span
                key={label}
                className="rounded-full border border-line bg-card px-3.5 py-1.5 text-sm font-semibold text-ink"
              >
                {count} {label} game{count === 1 ? "" : "s"}
              </span>
            ))}
            {genres.map(([label, count]) => (
              <span
                key={label}
                className="rounded-full border border-line bg-card px-3.5 py-1.5 text-sm font-medium text-stone-600"
              >
                {count} {label.toLowerCase()}
              </span>
            ))}
          </div>

          {/* This month */}
          <section className="mt-12">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold tracking-widest text-orange-600 uppercase">
                  Now arriving
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                  {monthLabel(year, month)} lineup
                </h2>
              </div>
              <Link
                href={`/new-games/${year}-${String(month).padStart(2, "0")}`}
                className="rounded-full border border-line-strong bg-card px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-stone-400"
              >
                See all {thisMonth.length} games →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {thisMonth.slice(0, 12).map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </section>

          {/* Next month */}
          {nextMonth.length > 0 && (
            <section className="mt-16">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold tracking-widest text-orange-600 uppercase">
                    Early warning
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                    {monthLabel(next.year, next.month)} preview
                  </h2>
                </div>
                <Link
                  href={`/new-games/${next.year}-${String(next.month).padStart(2, "0")}`}
                  className="rounded-full border border-line-strong bg-card px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-stone-400"
                >
                  Full {monthLabel(next.year, next.month).split(" ")[0]} guide →
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {nextMonth.slice(0, 9).map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </section>
          )}

          {/* Archive nav */}
          <section className="mt-16 rounded-2xl border border-line bg-card p-6">
            <h2 className="font-display text-lg font-bold text-ink">
              Browse the release archive
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { ...monthOffset(year, month, -1), label: "Last month" },
                { ...monthOffset(year, month, 0), label: "This month" },
                { ...monthOffset(year, month, 1), label: "Next month" },
              ].map((m) => (
                <Link
                  key={`${m.year}-${m.month}`}
                  href={`/new-games/${m.year}-${String(m.month).padStart(2, "0")}`}
                  className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-stone-400"
                >
                  {m.label} · {monthLabel(m.year, m.month)}
                </Link>
              ))}
            </div>
          </section>

          {/* SEO copy */}
          <section className="mt-14 max-w-3xl text-sm leading-relaxed text-stone-600">
            <h2 className="font-display text-lg font-bold text-ink">
              {monthLabel(year, month)} new game releases at a glance
            </h2>
            <p className="mt-3">
              {thisMonth.length > 0
                ? `${monthLabel(year, month)} ships at least ${thisMonth.length} new games${
                    platforms[0] ? `, led by ${platforms[0][0]} with ${platforms[0][1]} titles` : ""
                  }${
                    genres[0] ? ` and a strong ${genres[0][0].toLowerCase()} showing` : ""
                  }.`
                : "We're pulling this month's calendar."}
            </p>
            <p className="mt-3">
              Every entry is indexed with its release date, platforms and
              Metacritic score where available, so you can spot the big
              launches early, find hidden gems, and — most importantly — stop
              buying games you&apos;ll never play. Bookmark this page or check
              the{" "}
              <Link href="/releases" className="font-semibold text-orange-600 underline decoration-orange-300 underline-offset-2 hover:text-orange-500">
                Release Radar
              </Link>{" "}
              for the day-by-day version.
            </p>
          </section>
        </>
      )}
    </div>
  );
}