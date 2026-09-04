import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import GameCard from "@/components/GameCard";
import ShelfButton from "@/components/ShelfButton";
import SetupBanner from "@/components/SetupBanner";
import {
  formatReleaseDate,
  getApiKey,
  platformLabel,
  type RawgGame,
} from "@/lib/rawg";
import {
  dailyVaultPicks,
  fetchOlderPool,
  monthlyVaultPick,
  vaultDayLabel,
  vaultMonthLabel,
} from "@/lib/vault";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "The Vault — Older Games Worth Playing Today",
  description:
    "Five older, well-rated games hand-picked fresh every day, plus one monthly spotlight. Dig out the gems you skipped the first time around.",
};

export default async function VaultPage() {
  const needsKey = !getApiKey();
  let pool: RawgGame[] = [];
  let failed = false;

  if (!needsKey) {
    try {
      pool = await fetchOlderPool();
    } catch {
      failed = true;
    }
  }

  const picks = dailyVaultPicks(pool);
  const spotlight = monthlyVaultPick(pool);
  const dayLabel = vaultDayLabel();
  const monthLabel = vaultMonthLabel();

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-8 sm:py-16">
      <p className="text-xs font-bold tracking-[0.22em] text-orange-600 uppercase">
        The Vault
      </p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
        Older games. Still great. New picks daily.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-stone-600">
        The release radar only shows what&apos;s new — the Vault digs out the
        well-rated older titles you walked past the first time. Five new picks
        every day (same ones for everyone, so blame us together), plus one
        monthly deep-cut spotlight.
      </p>

      <div className="mt-10">
        {needsKey ? (
          <SetupBanner />
        ) : failed || pool.length === 0 ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
            <p className="text-3xl">🗄️</p>
            <p className="mt-3 font-display text-lg font-bold text-amber-900">
              The Vault door is stuck.
            </p>
            <p className="mt-1 text-sm text-amber-900/80">
              The game database isn&apos;t answering right now. Come back in a
              minute — the picks rotate daily anyway.
            </p>
          </div>
        ) : (
          <>
            {/* Monthly spotlight */}
            {spotlight && (
              <section className="mb-14">
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold tracking-widest text-orange-600 uppercase">
                      Spotlight of the month
                    </p>
                    <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                      {monthLabel}&apos;s deep cut
                    </h2>
                  </div>
                  <span className="hidden rounded-full border border-line bg-card px-3 py-1.5 font-mono text-xs text-stone-500 sm:inline-flex">
                    Rotates monthly
                  </span>
                </div>

                <article className="group grid grid-cols-1 items-stretch overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-card-soft transition-shadow hover:shadow-xl md:grid-cols-12">
                  <div className="relative h-64 w-full overflow-hidden bg-stone-950 md:col-span-5 md:h-auto">
                    {spotlight.background_image ? (
                      <Image
                        src={spotlight.background_image}
                        alt={spotlight.name}
                        fill
                        sizes="(min-width: 768px) 42vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-gradient-to-br from-stone-200 to-stone-300 text-5xl">
                        🎮
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:bg-gradient-to-r" />
                    {spotlight.metacritic != null && (
                      <span className="absolute top-4 left-4 z-10 rounded-full bg-stone-950/85 px-3 py-1 text-xs font-bold text-amber-300 backdrop-blur-sm">
                        Metacritic {spotlight.metacritic}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col justify-center gap-4 p-7 md:col-span-7 md:p-10">
                    <div>
                      <p className="text-xs font-semibold tracking-wide text-stone-400 uppercase">
                        {spotlight.genres.slice(0, 2).map((g) => g.name).join(" • ") ||
                          "Older gem"}{" "}
                        · {formatReleaseDate(spotlight.released)}
                      </p>
                      <h3 className="mt-2 font-display text-2xl font-bold tracking-tight text-stone-950 sm:text-3xl">
                        {spotlight.name}
                      </h3>
                      <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-600">
                        {spotlight.rating > 0
                          ? `Rated ${spotlight.rating.toFixed(1)}/5 by the community — proof it held up past launch hype.`
                          : "The community has spoken, and this one earned its spot in the Vault."}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
                      <p className="text-xs font-medium text-stone-500">
                        {[...new Set(
                          spotlight.platforms.slice(0, 4).map((p) => platformLabel(p.platform.slug)),
                        )].join(" · ") || "Multi-platform"}
                      </p>
                      <ShelfButton
                        game={{
                          id: spotlight.id,
                          name: spotlight.name,
                          background_image: spotlight.background_image,
                          released: spotlight.released,
                        }}
                      />
                    </div>
                  </div>
                </article>
              </section>
            )}

            {/* Daily 5 */}
            <section>
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold tracking-widest text-orange-600 uppercase">
                    Today&apos;s rotation
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                    Five for {dayLabel}
                  </h2>
                  <p className="mt-1 text-sm text-stone-500">
                    Same five for everyone today — tomorrow they&apos;re gone.
                  </p>
                </div>
              </div>

              {picks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-stone-300 bg-card p-12 text-center">
                  <p className="text-3xl">🛋️</p>
                  <p className="mt-3 font-display text-base font-bold text-ink">
                    The Vault is still warming up.
                  </p>
                  <p className="mt-1 text-sm text-stone-500">
                    Check back in a bit — today&apos;s five are being dusted off.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {picks.map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                  {/* filler cell keeps the daily-5 layout balanced */}
                  {picks.length < 5 && (
                    <div className="flex items-center justify-center rounded-2xl border border-dashed border-stone-200 p-8 text-sm text-stone-400">
                      More gems arriving tomorrow.
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* SEO copy */}
            <section className="mt-14 border-t border-stone-200/70 pt-10">
              <h2 className="font-display text-xl font-bold tracking-tight text-ink">
                Why older games?
              </h2>
              <div className="mt-3 max-w-3xl space-y-3 text-sm leading-relaxed text-stone-600">
                <p>
                  New-release feeds bury the catalog. The Vault pulls
                  well-rated games released before 2023 — the ones that defined
                  a genre, aged gracefully, or simply got lost under a launch
                  calendar — and rotates five fresh picks every single day, so
                  there&apos;s always something worth a second look.
                </p>
                <p>
                  See something you skipped? Add it to{" "}
                  <Link href="/shelf" className="font-semibold text-orange-600 hover:underline">
                    My Shelf
                  </Link>{" "}
                  and it&apos;ll be waiting whenever you actually get to it.
                  Want the shiny new stuff instead? The{" "}
                  <Link href="/releases" className="font-semibold text-orange-600 hover:underline">
                    Release Radar
                  </Link>{" "}
                  has you covered.
                </p>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}