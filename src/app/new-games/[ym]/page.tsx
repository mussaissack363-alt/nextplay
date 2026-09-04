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

const MONTH_RE = /^(\d{4})-(\d{2})$/;

function parseYm(ym: string): { year: number; month: number } | null {
  const m = MONTH_RE.exec(ym);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (month < 1 || month > 12) return null;
  return { year, month };
}

export function generateStaticParams() {
  const now = new Date();
  const base = { year: now.getFullYear(), month: now.getMonth() + 1 };
  return [-1, 0, 1].map((delta) => {
    const m = monthOffset(base.year, base.month, delta);
    return { ym: `${m.year}-${String(m.month).padStart(2, "0")}` };
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ym: string }>;
}): Promise<Metadata> {
  const { ym } = await params;
  const parsed = parseYm(ym);
  if (!parsed) {
    return { title: "New Games | NextPlay" };
  }
  const label = monthLabel(parsed.year, parsed.month);
  return {
    title: `New Games in ${label} — Full Release List`,
    description: `Every game releasing in ${label}: release dates, platforms, genres and scores. Plan your purchases before launch day.`,
  };
}

export default async function MonthPage({
  params,
}: {
  params: Promise<{ ym: string }>;
}) {
  const { ym } = await params;
  const parsed = parseYm(ym);
  const needsKey = !getApiKey();

  if (!parsed) {
    return (
      <div className="mx-auto w-full max-w-7xl px-6 py-16 text-center sm:px-8">
        <p className="text-4xl">🧭</p>
        <h1 className="mt-4 font-display text-3xl font-bold text-ink">
          That page drifted off the map.
        </h1>
        <p className="mt-2 text-stone-600">
          Months look like <code className="rounded bg-stone-100 px-1.5 py-0.5 text-sm">/new-games/2026-09</code>
        </p>
        <Link
          href="/new-games"
          className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-stone-800"
        >
          Back to this month
        </Link>
      </div>
    );
  }

  const { year, month } = parsed;
  const prev = monthOffset(year, month, -1);
  const next = monthOffset(year, month, 1);
  const label = monthLabel(year, month);

  let games: RawgGame[] = [];
  if (!needsKey) {
    try {
      const w = monthWindow(year, month);
      games = await fetchAllGames(
        { dates: `${w.start},${w.end}`, ordering: "-released" },
        80,
      );
    } catch {
      games = [];
    }
  }

  const byPlatform: Record<string, number> = {};
  for (const g of games) {
    const p = g.platforms.length ? platformLabel(g.platforms[0].platform.slug) : null;
    if (p) byPlatform[p] = (byPlatform[p] ?? 0) + 1;
  }
  const topPlatforms = Object.entries(byPlatform)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Upcoming games rarely have Metacritic scores yet — fall back to RAWG ratings.
  const topRated = [...games]
    .filter((g) => {
      if (g.metacritic != null) return true;
      return g.rating > 0;
    })
    .sort((a, b) => {
      const sa = a.metacritic ?? a.rating * 20;
      const sb = b.metacritic ?? b.rating * 20;
      return sb - sa;
    })
    .slice(0, 6);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-8 sm:py-16">
      {/* Breadcrumb-ish back link */}
      <Link
        href="/new-games"
        className="text-sm font-semibold text-orange-600 hover:text-orange-500"
      >
        ← New games this month
      </Link>

      <p className="mt-6 text-xs font-bold tracking-[0.22em] text-orange-600 uppercase">
        Release guide
      </p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
        New Games in {label}
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-stone-600">
        {games.length > 0
          ? `${games.length} confirmed releases in ${label}${
              topPlatforms[0] ? ` — ${topPlatforms[0][1]} on ${topPlatforms[0][0]}` : ""
            }.`
          : "Loading this month’s calendar…"}
      </p>

      {needsKey ? (
        <div className="mt-10">
          <SetupBanner />
        </div>
      ) : (
        <>
          {topPlatforms.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {topPlatforms.map(([labelName, count]) => (
                <span
                  key={labelName}
                  className="rounded-full border border-line bg-card px-3.5 py-1.5 text-sm font-semibold text-ink"
                >
                  {count} {labelName}
                </span>
              ))}
            </div>
          )}

          {/* All releases */}
          <section className="mt-10">
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
              Every {label} release
            </h2>
            {games.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-card p-12 text-center">
                <p className="text-3xl">🛰️</p>
                <p className="mt-3 font-display text-base font-bold text-ink">
                  No releases found for this month.
                </p>
                <p className="mt-1 text-sm text-stone-500">
                  Either the industry took a month off, or the calendar is
                  still filling up.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {games.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            )}
          </section>

          {/* Highest rated */}
          {topRated.length > 0 && (
            <section className="mt-16">
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
                Highest rated in {label}
              </h2>
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {topRated.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </section>
          )}

          {/* Prev / next */}
          <nav className="mt-16 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-8">
            <Link
              href={`/new-games/${prev.year}-${String(prev.month).padStart(2, "0")}`}
              className="rounded-full border border-line-strong bg-card px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-stone-400"
            >
              ← {monthLabel(prev.year, prev.month)}
            </Link>
            <Link
              href={`/new-games/${next.year}-${String(next.month).padStart(2, "0")}`}
              className="rounded-full border border-line-strong bg-card px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-stone-400"
            >
              {monthLabel(next.year, next.month)} →
            </Link>
          </nav>

          {/* SEO copy */}
          <section className="mt-12 max-w-3xl text-sm leading-relaxed text-stone-600">
            <p>
              Looking for what&apos;s new in gaming right now? The{" "}
              <Link
                href="/releases"
                className="font-semibold text-orange-600 underline decoration-orange-300 underline-offset-2 hover:text-orange-500"
              >
                Release Radar
              </Link>{" "}
              tracks what drops today, this week, and this month with platform
              and genre filters — while this guide collects the full{" "}
              {label} release calendar in one place. Scores are pulled from
              Metacritic and RAWG, and every game can be added straight to your
              NextPlay shelf.
            </p>
          </section>
        </>
      )}
    </div>
  );
}