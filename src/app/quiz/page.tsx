import type { Metadata } from "next";
import QuizClient from "@/components/QuizClient";
import { fetchAllGames, getApiKey, type RawgGame } from "@/lib/rawg";

export const metadata: Metadata = {
  title: "Next Play Quiz — Find Your Next Game in 5 Questions",
  description:
    "Answer five questions about mood, time and platform. Get six games you'll actually play, plus a shareable verdict card.",
};

const POOL_SIZE = 320; // 8 RAWG pages of top-rated games, baked at build time

export default async function QuizPage() {
  const needsKey = !getApiKey();
  let pool: RawgGame[] = [];

  if (!needsKey) {
    try {
      pool = await fetchAllGames({ ordering: "-rating" }, POOL_SIZE);
    } catch {
      pool = [];
    }
  }

  return <QuizClient pool={pool} needsKey={needsKey} />;
}