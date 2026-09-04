import Image from "next/image";
import Link from "next/link";
import ShelfButton from "@/components/ShelfButton";
import SetupBanner from "@/components/SetupBanner";
import {
  fetchGames,
  formatReleaseDate,
  getApiKey,
  platformLabel,
  windowDates,
  type RawgGame,
} from "@/lib/rawg";
import { currentSeasonLabel, fetchSeasonalAnime, type Anime } from "@/lib/anime";
import { dailyVaultPicks, fetchOlderPool } from "@/lib/vault";

export const revalidate = 3600;

function platformsList(game: RawgGame, max = 4): string {
  return [
    ...new Set(
      (game.platforms ?? [])
        .slice(0, max)
        .map((p) => platformLabel(p.platform.slug)),
    ),
  ].join(" · ");
}

function genreLine(game: RawgGame, max = 2): string {
  const names = (game.genres ?? []).slice(0, max).map((g) => g.name);
  return names.length > 0 ? names.join(" • ") : "Upcoming";
}

function scoreText(game: RawgGame): string {
  if (game.metacritic != null) return String(game.metacritic);
  return game.rating > 0 ? game.rating.toFixed(1) : "—";
}

export default async function Home() {
  let games: RawgGame[] = [];
  const needsKey = !getApiKey();

  if (!needsKey) {
    try {
      const { start, end } = windowDates("week");
      games =
        (await fetchGames({ dates: `${start},${end}`, ordering: "-released" }, 6)) ?? [];
    } catch {
      games = [];
    }
  }

  let seasonalAnime: Anime[] = [];
  try {
    seasonalAnime = await fetchSeasonalAnime(5);
  } catch {
    seasonalAnime = [];
  }

  let vaultPicks: RawgGame[] = [];
  if (!needsKey) {
    try {
      vaultPicks = dailyVaultPicks(await fetchOlderPool(120));
    } catch {
      vaultPicks = [];
    }
  }

  const covers = games.filter((g) => g.background_image).slice(0, 3);
  const hero = covers[1] ?? covers[0];
  const radarCard = games[0] ?? covers[0];
  const lead = covers[2] ?? covers[0];
  const miniA = covers[0];
  const miniB = covers[1];

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Ambient dot overlay */}
      <div
        aria-hidden
        className="subtle-dot-grid pointer-events-none absolute inset-0 z-0 opacity-80"
      />

      <main className="relative z-10">
        {/* ============ HERO ============ */}
        <section className="bg-mesh-pattern relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24">
          <div className="mx-auto max-w-7xl px-6 sm:px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
              {/* Left: typographic drama */}
              <div className="z-10 flex flex-col items-start lg:col-span-7 lg:pr-4">
                <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-orange-200/70 bg-orange-100/70 px-3.5 py-1.5 text-[11px] font-bold tracking-widest text-orange-700 uppercase">
                  <span className="h-2 w-2 animate-ping rounded-full bg-orange-500" />
                  Your personal gaming sidekick
                </div>

                <h1 className="mb-7 text-5xl leading-[1.02] font-black tracking-tight text-stone-950 sm:text-7xl lg:text-[5.4rem]">
                  Stop buying games.
                  <br />
                  <span
                    className="mr-2 inline-block -rotate-1 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 bg-clip-text pr-2 font-serif font-normal tracking-normal text-transparent italic"
                    style={{ fontSize: "1.15em" }}
                  >
                    Start playing
                  </span>
                  <span className="font-black tracking-tight text-stone-950">
                    them.
                  </span>
                </h1>

                <p className="mb-9 max-w-xl text-lg font-normal leading-relaxed text-stone-600 sm:text-xl">
                  Release Radar cuts through the marketing noise. My Shelf
                  gently holds your 47 unplayed gems accountable. The Next Play
                  Quiz matches your exact mood in 3 minutes. Zero tracking,
                  zero fluff.
                </p>

                <div className="mb-10 flex w-full flex-wrap items-center gap-4 sm:w-auto">
                  <Link
                    href="/releases"
                    className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-stone-950 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-stone-950/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-600 sm:w-auto"
                  >
                    <span>See this week&apos;s drops</span>
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                  <Link
                    href="/quiz"
                    className="inline-flex w-full items-center justify-center rounded-full border border-stone-200 bg-white px-7 py-4 text-sm font-bold text-stone-800 shadow-card-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50/40 sm:w-auto"
                  >
                    Find my next play
                  </Link>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-stone-500">
                  <span className="flex items-center gap-1.5 text-stone-700">
                    <svg
                      className="h-4 w-4 text-emerald-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden
                    >
                      <path
                        clipRule="evenodd"
                        d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0Z"
                        fillRule="evenodd"
                      />
                    </svg>
                    Free forever
                  </span>
                  <span className="text-stone-300">•</span>
                  <span>No credit card or account</span>
                  <span className="text-stone-300">•</span>
                  <span className="inline-flex items-center gap-1 text-stone-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                    Verified RAWG database
                  </span>
                </div>
              </div>

              {/* Right: layered 3D deck */}
              <div className="relative flex items-center justify-center py-8 lg:col-span-5 lg:py-0">
                <div className="relative flex h-[460px] w-full max-w-md items-center justify-center">
                  {/* warm glow */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -top-10 -right-6 -z-10 h-64 w-64 rounded-full bg-gradient-to-tr from-orange-400/20 to-amber-300/30 blur-3xl"
                  />

                  {hero && radarCard ? (
                    <div
                      className="relative flex h-full w-full items-center justify-center"
                      style={{
                        transform:
                          "perspective(1000px) rotateY(-8deg) rotateX(4deg) rotateZ(1deg)",
                        transformStyle: "preserve-3d",
                      }}
                    >
                      {/* Back underlay: radar mini-card */}
                      <div className="absolute flex h-80 w-60 -translate-x-14 -translate-y-8 -rotate-6 transform flex-col justify-between rounded-3xl border border-stone-200/90 bg-white/70 p-5 shadow-card-soft backdrop-blur-md transition-transform duration-300">
                        <div className="flex items-center justify-between">
                          <span className="rounded-full bg-orange-100/60 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-orange-600 uppercase">
                            Radar Ping
                          </span>
                          <span className="font-mono text-xs text-stone-400">
                            #{radarCard.id % 100}
                          </span>
                        </div>
                        <div className="space-y-1.5 py-2">
                          {[games[0], games[1], games[2]]
                            .filter(Boolean)
                            .map((g) => (
                              <p
                                key={g!.id}
                                className="truncate text-xs font-medium text-stone-600"
                              >
                                {g!.name}
                              </p>
                            ))}
                        </div>
                        <div className="flex items-center justify-between border-t border-stone-100 pt-3 text-[11px] font-medium text-stone-500">
                          <span>{platformsList(hero) || "Multi-platform"}</span>
                          <span className="font-bold text-emerald-600">
                            {games.length > 0 ? `+${games.length} this week` : "live"}
                          </span>
                        </div>
                      </div>

                      {/* Primary cover card */}
                      <div className="absolute z-20 flex h-[390px] w-64 -translate-y-2 translate-x-2 transform flex-col justify-between overflow-hidden rounded-3xl border-4 border-white bg-stone-950 shadow-2xl transition-transform duration-300 hover:scale-[1.02] sm:w-72">
                        <div className="relative h-full w-full">
                          <Image
                            src={hero.background_image!}
                            alt={hero.name}
                            fill
                            sizes="288px"
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/30" />
                          {/* top chips */}
                          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-5">
                            <span className="rounded-lg border border-teal-400/40 bg-teal-400/20 px-2.5 py-1 text-[10px] font-extrabold text-teal-300 backdrop-blur-sm">
                              {scoreText(hero) !== "—"
                                ? `SCORE ${scoreText(hero)}`
                                : "RAWG DATA"}
                            </span>
                            <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-xs text-stone-200 backdrop-blur-sm">
                              HOT DROP
                            </span>
                          </div>
                          {/* bottom info bar */}
                          <div className="absolute inset-x-3 bottom-3 z-10 rounded-2xl border border-white/10 bg-stone-900/90 p-3.5 backdrop-blur-md">
                            <div className="mb-1 flex items-center justify-between gap-2">
                              <span className="truncate text-sm font-bold tracking-tight text-white">
                                {hero.name}
                              </span>
                              <span className="shrink-0 text-xs font-bold text-amber-400">
                                ★ {scoreText(hero)}
                              </span>
                            </div>
                            <p className="truncate text-[11px] text-stone-400">
                              {genreLine(hero)} · {formatReleaseDate(hero.released)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Floating quiz match card */}
                      <Link
                        href="/quiz"
                        className="absolute z-30 w-52 translate-x-28 translate-y-28 rotate-3 transform rounded-2xl border border-orange-200/80 bg-white/95 p-4 shadow-xl backdrop-blur-lg transition-transform duration-300 hover:rotate-0"
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-xs text-white shadow-sm shadow-orange-500/40">
                            🎯
                          </span>
                          <div>
                            <div className="text-[11px] leading-none font-bold text-stone-900">
                              Quiz Match
                            </div>
                            <div className="text-[9px] font-semibold text-orange-600">
                              Built for your taste
                            </div>
                          </div>
                        </div>
                        <p className="text-[10px] leading-snug font-medium text-stone-600">
                          Five questions, six games you&apos;ll actually
                          play. No purchase pressure.
                        </p>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid h-[380px] w-full max-w-md place-items-center rounded-3xl border border-dashed border-stone-300 bg-white/60 text-center">
                      <p className="px-8 text-sm text-stone-500">
                        {needsKey
                          ? "Add your RAWG key to see this week’s drops here."
                          : "This week’s covers are loading…"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ BENTO FEATURES ============ */}
        <section className="relative pt-8 pb-20">
          <div className="mx-auto max-w-7xl px-6 sm:px-8">
            {/* section header */}
            <div className="mb-8 flex items-center justify-between border-b border-stone-200/70 pb-4">
              <div>
                <span className="mb-1 block text-[11px] font-black tracking-widest text-orange-600 uppercase">
                  Sidekick ecosystem
                </span>
                <h2 className="text-2xl font-extrabold tracking-tight text-stone-950 sm:text-3xl">
                  Everything you need. Nothing you don&apos;t.
                </h2>
              </div>
              <span className="hidden rounded-full border border-stone-200 bg-stone-100 px-3 py-1.5 font-mono text-xs text-stone-400 sm:inline-flex">
                No ads • RAWG powered
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
              {/* Bento 1: wide Release Radar */}
              <Link
                href="/releases"
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-stone-200/80 bg-white/90 p-8 shadow-card-soft backdrop-blur-md transition-all duration-300 hover:shadow-glow-orange sm:p-10 lg:col-span-8"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-orange-100/50 blur-3xl transition-transform duration-500 group-hover:scale-125"
                />
                <div className="z-10 mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-xl text-white shadow-md shadow-orange-500/20">
                      📡
                    </span>
                    <div>
                      <span className="block text-xs font-bold tracking-wider text-orange-600 uppercase">
                        Feature 01
                      </span>
                      <h3 className="text-2xl font-bold tracking-tight text-stone-950 transition-colors group-hover:text-orange-600">
                        Release Radar
                      </h3>
                    </div>
                  </div>
                  <span className="flex items-center gap-2 self-start rounded-full border border-stone-200 bg-stone-100/90 px-3 py-1.5 text-xs font-semibold text-stone-700 sm:self-auto">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                    Refreshed every hour
                  </span>
                </div>
                <p className="z-10 mb-8 max-w-xl text-base leading-relaxed text-stone-600">
                  Every launch landing today, this week, and this month —
                  filtered by platform and genre so you don’t impulse-buy 47
                  games on launch day. Again.
                </p>
                {/* live preview strip */}
                <div className="z-10 grid grid-cols-1 gap-3 border-t border-stone-100 pt-4 sm:grid-cols-3">
                  {games[0] && (
                    <div className="rounded-2xl border border-stone-200/60 bg-stone-50/80 p-3.5">
                      <span className="mb-1 block text-[10px] font-bold tracking-wide text-stone-400 uppercase">
                        This week
                      </span>
                      <span className="block truncate text-sm font-bold text-stone-900">
                        {games[0].name}
                      </span>
                      <span className="text-[11px] font-semibold text-orange-600">
                        {formatReleaseDate(games[0].released)}
                      </span>
                    </div>
                  )}
                  {games[1] && (
                    <div className="rounded-2xl border border-stone-200/60 bg-stone-50/80 p-3.5">
                      <span className="mb-1 block text-[10px] font-bold tracking-wide text-stone-400 uppercase">
                        Trending
                      </span>
                      <span className="block truncate text-sm font-bold text-stone-900">
                        {games[1].name}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-600">
                        ★ {scoreText(games[1])} on RAWG
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col justify-between rounded-2xl border border-stone-200/60 bg-stone-50/80 p-3.5">
                    <span className="mb-1 block text-[10px] font-bold tracking-wide text-stone-400 uppercase">
                      Platform filters
                    </span>
                    <div className="flex items-center gap-1 font-mono text-[11px] text-stone-600">
                      <span className="rounded border border-stone-200 bg-white px-1.5 py-0.5">
                        PC
                      </span>
                      <span className="rounded border border-stone-200 bg-white px-1.5 py-0.5">
                        PS5
                      </span>
                      <span className="rounded border border-stone-200 bg-white px-1.5 py-0.5">
                        Switch
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Bento 2: dark My Shelf */}
              <Link
                href="/shelf"
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-stone-800 bg-stone-950 p-8 text-white shadow-xl transition-all duration-300 hover:-translate-y-0.5 lg:col-span-4"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full bg-orange-600/10 blur-2xl"
                />
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/20 text-lg text-amber-300">
                      📦
                    </span>
                    <span className="rounded-full border border-stone-800 bg-stone-900 px-2.5 py-1 font-mono text-[10px] tracking-wider text-stone-400 uppercase">
                      My Shelf • Backlog
                    </span>
                  </div>
                  <h3 className="mb-2 text-xl font-bold tracking-tight text-white">
                    Gentle Backlog Judgment
                  </h3>
                  <p className="mb-6 text-xs leading-relaxed text-stone-400">
                    Playing, Want, Beaten, or Dropped — honest statistics about
                    how many titles you bought and never launched.
                  </p>
                </div>
                <div className="space-y-2 rounded-2xl border border-stone-800 bg-stone-900/90 p-4">
                  {[
                    { dot: "bg-emerald-500", label: "Playing", hint: "active right now" },
                    { dot: "bg-sky-500", label: "Want", hint: "the wishlist trap" },
                    { dot: "bg-stone-100", label: "Beaten", hint: "credits rolled" },
                    { dot: "bg-rose-500", label: "Dropped", hint: "we don’t judge" },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center gap-2.5 text-xs"
                    >
                      <span className={`h-2 w-2 rounded-full ${row.dot}`} />
                      <span className="font-bold text-stone-200">{row.label}</span>
                      <span className="ml-auto text-stone-500">{row.hint}</span>
                    </div>
                  ))}
                </div>
              </Link>

              {/* Bento 3: wide quiz banner */}
              <Link
                href="/quiz"
                className="group relative overflow-hidden rounded-3xl border border-orange-200/80 bg-gradient-to-br from-orange-50 via-white to-amber-50/60 p-8 shadow-card-soft transition-all duration-300 hover:shadow-xl sm:p-10 lg:col-span-12"
              >
                <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
                  <div className="lg:col-span-7">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-300/40 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-700">
                      <span>🎯 Next Play Quiz</span>
                      <span className="text-orange-300">•</span>
                      <span>Takes under 3 minutes</span>
                    </div>
                    <h3 className="mb-3 text-2xl font-extrabold tracking-tight text-stone-950 sm:text-3xl">
                      Paralyzed by your backlog? We’ll pick your exact tonight
                      game.
                    </h3>
                    <p className="max-w-xl text-sm leading-relaxed text-stone-600">
                      Answer 5 micro-questions about mood, time commitment, and
                      tolerance for frustration. Get six laser-matched
                      recommendations plus a verdict card to settle the group
                      chat argument.
                    </p>
                  </div>
                  <div className="flex flex-col items-start justify-center gap-3 lg:col-span-5 lg:items-end">
                    <span className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-600/25 transition-colors group-hover:bg-orange-700 sm:w-auto">
                      <span>Take the 5-question test</span>
                      <span>→</span>
                    </span>
                    <span className="text-[11px] font-medium text-stone-500">
                      No sign up needed • Export your result card
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* ============ THIS WEEK'S DROPS ============ */}
        <section className="relative border-t border-stone-200/70 bg-white/50 pt-14 pb-24 backdrop-blur-xs">
          <div className="mx-auto max-w-7xl px-6 sm:px-8">
            {/* editorial header */}
            <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-black tracking-widest text-orange-600 uppercase">
                  <span className="h-2 w-2 rounded-full bg-orange-500" />
                  Now releasing
                </div>
                <h2 className="text-3xl font-black tracking-tight text-stone-950 sm:text-4xl">
                  This week’s curated drops
                </h2>
                <p className="mt-1 text-sm font-normal text-stone-500">
                  Fresh out of the oven with verified scores and zero publisher
                  marketing spin.
                </p>
              </div>
              <Link
                href="/releases"
                className="inline-flex items-center gap-2 self-start rounded-full border border-stone-200 bg-white px-5 py-2.5 text-xs font-bold text-stone-900 shadow-xs transition-all hover:bg-stone-100 hover:text-orange-600 sm:self-auto"
              >
                <span>Full radar archive</span>
                <span>→</span>
              </Link>
            </div>

            {needsKey ? (
              <SetupBanner />
            ) : games.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-12 text-center">
                <p className="text-3xl">🌵</p>
                <p className="mt-3 text-base font-bold text-stone-900">
                  Nothing dropping this week, apparently.
                </p>
                <p className="mt-1 text-sm text-stone-500">
                  The industry is on a breather. Check the full radar.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
                {/* Big lead card */}
                {lead && (
                  <article className="group flex flex-col overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-card-soft transition-all duration-300 hover:shadow-xl lg:col-span-7">
                    <div className="relative h-64 w-full overflow-hidden bg-stone-950 sm:h-80">
                      <Image
                        src={lead.background_image!}
                        alt={lead.name}
                        fill
                        sizes="(min-width: 1024px) 58vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-stone-950/20" />
                      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                        <span className="rounded-full bg-orange-600 px-3 py-1 text-[10px] font-extrabold tracking-wider text-white uppercase shadow-sm">
                          Radar spotlight
                        </span>
                        <span className="rounded-full bg-black/60 px-2.5 py-1 font-mono text-[10px] text-white backdrop-blur-xs">
                          {platformsList(lead, 3)}
                        </span>
                      </div>
                      {scoreText(lead) !== "—" && (
                        <span className="absolute top-4 right-4 z-10 rounded-lg bg-white/95 px-2.5 py-1 text-xs font-bold text-stone-950 shadow-sm">
                          ★ {scoreText(lead)}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col justify-between p-6 sm:p-8">
                      <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="text-xs font-semibold tracking-wide text-orange-600 uppercase">
                            {genreLine(lead, 3)}
                          </span>
                          <span className="font-mono text-xs text-stone-400">
                            {formatReleaseDate(lead.released)}
                          </span>
                        </div>
                        <h3 className="mb-2 text-2xl font-black text-stone-950 transition-colors group-hover:text-orange-600">
                          {lead.name}
                        </h3>
                        <p className="mb-6 text-sm leading-relaxed text-stone-600">
                          {genreLine(lead, 2)} landing {formatReleaseDate(lead.released)}{" "}
                          {platformsList(lead, 3) ? `on ${platformsList(lead, 3)}` : ""}.
                          Our pick of the week for people who scroll the store
                          more than they play.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-stone-500">
                            Your shelf:
                          </span>
                        </div>
                        <ShelfButton
                          game={{
                            id: lead.id,
                            name: lead.name,
                            background_image: lead.background_image,
                            released: lead.released,
                          }}
                        />
                      </div>
                    </div>
                  </article>
                )}

                {/* Right column: staggered minis */}
                <div className="flex flex-col gap-6 lg:col-span-5">
                  {miniA && (
                    <Link
                      href="/releases"
                      className="group flex items-center gap-4 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-orange-200 bg-stone-100">
                        {miniA.background_image ? (
                          <Image
                            src={miniA.background_image}
                            alt={miniA.name}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-2xl">
                            🎮
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold tracking-wider text-orange-600 uppercase">
                            {formatReleaseDate(miniA.released)}
                          </span>
                          <span className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[10px] text-stone-500">
                            {platformsList(miniA, 1)}
                          </span>
                        </div>
                        <h4 className="truncate text-base font-bold text-stone-900 transition-colors group-hover:text-orange-600">
                          {miniA.name}
                        </h4>
                        <p className="mb-2 line-clamp-1 text-xs text-stone-500">
                          {genreLine(miniA, 3)}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-amber-600">
                            ★ {scoreText(miniA)} on RAWG
                          </span>
                          <span className="text-xs font-semibold text-stone-700 transition-colors hover:text-orange-600">
                            Track +
                          </span>
                        </div>
                      </div>
                    </Link>
                  )}

                  {miniB && (
                    <Link
                      href="/releases"
                      className="group flex items-center gap-4 rounded-2xl border border-stone-800 bg-stone-950 p-5 text-white shadow-md transition-all duration-300 hover:shadow-xl"
                    >
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-stone-700 bg-stone-900">
                        {miniB.background_image ? (
                          <Image
                            src={miniB.background_image}
                            alt={miniB.name}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-2xl">
                            🎮
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center justify-between gap-1">
                          <span className="font-mono text-[10px] font-semibold tracking-wider text-orange-400 uppercase">
                            {genreLine(miniB, 1)}
                          </span>
                          <span className="font-mono text-[10px] text-stone-400">
                            {formatReleaseDate(miniB.released)}
                          </span>
                        </div>
                        <h4 className="truncate text-base font-bold text-white transition-colors group-hover:text-orange-400">
                          {miniB.name}
                        </h4>
                        <p className="mb-2 line-clamp-1 text-xs text-stone-400">
                          {genreLine(miniB, 3)} · ★ {scoreText(miniB)}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-stone-300">
                            {platformsList(miniB, 2)}
                          </span>
                          <span className="text-xs font-bold text-orange-400 transition-colors hover:text-orange-300">
                            Track +
                          </span>
                        </div>
                      </div>
                    </Link>
                  )}

                  <div className="flex items-center justify-between rounded-2xl border border-orange-200/60 bg-orange-50/70 p-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">⚡</span>
                      <div>
                        <div className="text-xs font-bold text-stone-900">
                          Missed last week?
                        </div>
                        <div className="text-[11px] text-stone-500">
                          The full release archive is one click away
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/releases"
                      className="text-xs font-bold text-orange-600 underline hover:text-orange-700"
                    >
                      View all
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ============ THE VAULT ============ */}
        {vaultPicks.length > 0 && (
          <section className="relative border-t border-stone-200/70 pt-14 pb-20">
            <div className="mx-auto max-w-7xl px-6 sm:px-8">
              <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs font-black tracking-widest text-orange-600 uppercase">
                    <span className="h-2 w-2 rounded-full bg-orange-500" />
                    The Vault · today&apos;s five
                  </div>
                  <h2 className="text-3xl font-black tracking-tight text-stone-950 sm:text-4xl">
                    Older games. Still great. Fresh picks daily.
                  </h2>
                  <p className="mt-1 text-sm font-normal text-stone-500">
                    Well-rated classics that aren&apos;t new anymore — same five
                    for everyone, gone tomorrow.
                  </p>
                </div>
                <Link
                  href="/vault"
                  className="inline-flex items-center gap-2 self-start rounded-full border border-stone-200 bg-white px-5 py-2.5 text-xs font-bold text-stone-900 shadow-xs transition-all hover:bg-stone-100 hover:text-orange-600 sm:self-auto"
                >
                  <span>Open the Vault</span>
                  <span>→</span>
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {vaultPicks.map((g) => (
                  <Link
                    key={g.id}
                    href="/vault"
                    className="group overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative h-40 w-full overflow-hidden bg-stone-100 sm:h-48">
                      {g.background_image ? (
                        <Image
                          src={g.background_image}
                          alt={g.name}
                          fill
                          sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 50vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-3xl">
                          🎮
                        </div>
                      )}
                      {g.metacritic != null && (
                        <span className="absolute top-2.5 right-2.5 rounded-full bg-stone-950/85 px-2 py-0.5 text-[10px] font-bold text-amber-300 backdrop-blur-sm">
                          {g.metacritic}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="line-clamp-1 text-sm font-bold text-stone-900 transition-colors group-hover:text-orange-600">
                        {g.name}
                      </h4>
                      <p className="mt-1 text-[11px] text-stone-500">
                        {(g.genres[0]?.name ?? "Older gem")} ·{" "}
                        {g.released?.slice(0, 4) ?? "TBA"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ============ NOW AIRING ANIME ============ */}
        {seasonalAnime.length > 0 && (
          <section className="relative border-t border-stone-200/70 pt-14 pb-20">
            <div className="mx-auto max-w-7xl px-6 sm:px-8">
              <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs font-black tracking-widest text-orange-600 uppercase">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                    Now airing · {currentSeasonLabel()}
                  </div>
                  <h2 className="text-3xl font-black tracking-tight text-stone-950 sm:text-4xl">
                    This season&apos;s anime, pre-screened.
                  </h2>
                  <p className="mt-1 text-sm font-normal text-stone-500">
                    Real community scores, zero three-episode traps.
                  </p>
                </div>
                <Link
                  href="/anime"
                  className="inline-flex items-center gap-2 self-start rounded-full border border-stone-200 bg-white px-5 py-2.5 text-xs font-bold text-stone-900 shadow-xs transition-all hover:bg-stone-100 hover:text-orange-600 sm:self-auto"
                >
                  <span>Full season lineup</span>
                  <span>→</span>
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {seasonalAnime.map((a) => (
                  <Link
                    key={a.id}
                    href="/anime"
                    className="group overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative h-40 w-full overflow-hidden bg-stone-100 sm:h-48">
                      {a.image ? (
                        <Image
                          src={a.image}
                          alt={a.title}
                          fill
                          sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 50vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-3xl">
                          🎬
                        </div>
                      )}
                      {a.score != null && (
                        <span className="absolute top-2.5 right-2.5 rounded-full bg-stone-950/85 px-2 py-0.5 text-[10px] font-bold text-amber-300 backdrop-blur-sm">
                          ★ {a.score.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="line-clamp-1 text-sm font-bold text-stone-900 transition-colors group-hover:text-orange-600">
                        {a.title}
                      </h4>
                      <p className="mt-1 text-[11px] text-stone-500">
                        {a.type ?? "TV"}
                        {a.episodes != null ? ` · ${a.episodes} eps` : ""} ·{" "}
                        {(a.genres[0]?.name ?? "Anime")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
