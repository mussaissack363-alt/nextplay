import type { Metadata } from "next";
import Link from "next/link";
import ReleaseExplorer from "@/components/ReleaseExplorer";
import SetupBanner from "@/components/SetupBanner";
import {
  fetchGames,
  getApiKey,
  windowDates,
  type RawgGame,
} from "@/lib/rawg";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Release Radar — new games this week and month",
  description:
    "Every game releasing today, this week, and this month — filter by platform and genre.",
};

export default async function ReleasesPage() {
  const needsKey = !getApiKey();
  let games: RawgGame[] = [];

  if (!needsKey) {
    try {
      const { start, end } = windowDates("week");
      games =
        (await fetchGames({ dates: `${start},${end}`, ordering: "-released" }, 24)) ?? [];
    } catch {
      games = [];
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-8 sm:py-16">
      <p className="text-xs font-bold tracking-[0.22em] text-orange-600 uppercase">
        Release Radar
      </p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
        What&apos;s dropping next?
      </h1>
      <p className="mt-4 max-w-xl text-lg text-stone-600">
        Everything launching now — filtered so you don&apos;t buy 47 games on
        launch day. Again. For the full month calendar, see the{" "}
        <Link
          href="/new-games"
          className="font-semibold text-orange-600 underline decoration-orange-300 underline-offset-2 hover:text-orange-500"
        >
          new games this month
        </Link>{" "}
        guide.
      </p>
      <div className="mt-10">
        {needsKey ? <SetupBanner /> : <ReleaseExplorer initialGames={games} />}
      </div>
    </div>
  );
}
