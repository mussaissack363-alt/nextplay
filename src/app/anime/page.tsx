import Link from "next/link";
import AnimeExplorer from "@/components/AnimeExplorer";
import { currentSeasonLabel, fetchSeasonalAnime, type Anime } from "@/lib/anime";

export const metadata = {
  title: "Anime Airing This Season — What to Watch Now",
  description:
    "The full seasonal anime lineup with community scores, genres, episode counts and airing status. Find what's actually worth watching this season.",
};

export default async function AnimePage() {
  let anime: Anime[] = [];
  let failed = false;
  try {
    anime = await fetchSeasonalAnime();
  } catch {
    failed = true;
  }

  const season = currentSeasonLabel();

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-8 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-bold tracking-[0.22em] text-orange-600 uppercase">
            Seasonal Anime Radar
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Airing right now. {season}.
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-stone-600">
            This season&apos;s lineup with real community scores — so you skip
            the three-episode trap and go straight to the good stuff. Powered by
            AniList + Jikan, refreshed every hour.
          </p>
        </div>
        <Link
          href="/shelf"
          className="inline-flex items-center gap-2 self-start rounded-full border border-line-strong bg-card px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-stone-400 sm:self-auto"
        >
          📺 Manage my watchlist
        </Link>
      </div>

      <div className="mt-10">
        {failed ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
            <p className="text-3xl">🍥</p>
            <p className="mt-3 font-display text-lg font-bold text-amber-900">
              The anime database is taking a nap.
            </p>
            <p className="mt-1 text-sm text-amber-900/80">
              Jikan (MyAnimeList&apos;s free API) is briefly unreachable. Try
              again in a minute.
            </p>
          </div>
        ) : anime.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-card p-12 text-center">
            <p className="text-3xl">🎌</p>
            <p className="mt-3 font-display text-base font-bold text-ink">
              No seasonal data returned.
            </p>
            <p className="mt-1 text-sm text-stone-500">
              The season list may still be filling up. Check back soon.
            </p>
          </div>
        ) : (
          <AnimeExplorer initialAnime={anime} />
        )}
      </div>

      {/* SEO copy */}
      <section className="mt-16 border-t border-stone-200/70 pt-10">
        <h2 className="font-display text-xl font-bold tracking-tight text-ink">
          What&apos;s airing this anime season?
        </h2>
        <div className="mt-3 max-w-3xl space-y-3 text-sm leading-relaxed text-stone-600">
          <p>
            Every {season.toLowerCase()} season brings a fresh batch of anime —
            sequels, remakes, and brand-new originals. This page tracks the full
            seasonal lineup with community scores, episode counts, genres, and
            live airing status, so you can separate the must-watches from the
            filler before you commit three episodes.
          </p>
          <p>
            Use the filters to narrow by genre (action, romance, fantasy,
            slice-of-life…), format (TV, movie, OVA, special), or airing status.
            Found something good? Add it to your watchlist — it lives in your
            browser alongside your game backlog on{" "}
            <Link href="/shelf" className="font-semibold text-orange-600 hover:underline">
              My Shelf
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}