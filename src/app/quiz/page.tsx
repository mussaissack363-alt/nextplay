"use client";

import Image from "next/image";
import { useState } from "react";
import { useShelf } from "@/hooks/useShelf";
import { platformLabel, type RawgGame } from "@/lib/rawg";
import {
  MOOD_HEADLINES,
  QUIZ_QUESTIONS,
  buildRecQuery,
  buildShareText,
  playtimeLimit,
  type QuizAnswers,
} from "@/lib/quiz";

type Phase = "quiz" | "loading" | "result";

export default function QuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const [phase, setPhase] = useState<Phase>("quiz");
  const [games, setGames] = useState<RawgGame[]>([]);
  const [needsKey, setNeedsKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const { entries } = useShelf();

  const question = QUIZ_QUESTIONS[step];
  const isLast = step === QUIZ_QUESTIONS.length - 1;

  const pick = async (value: string) => {
    const nextAnswers = { ...answers, [question.id]: value } as QuizAnswers;
    setAnswers(nextAnswers);

    if (!isLast) {
      setStep(step + 1);
      return;
    }

    setPhase("loading");
    const result = await getRecommendations(nextAnswers);
    setNeedsKey(result.needsKey);
    setGames(result.games);
    setPhase("result");
  };

  const retake = () => {
    setAnswers({});
    setStep(0);
    setGames([]);
    setPhase("quiz");
    setCopied(false);
  };

  const shelfCount = entries.length;
  const beatenCount = entries.filter((e) => e.status === "beaten").length;
  const shareText = buildShareText(
    games.map((g) => ({
      name: g.name,
      platforms: g.platforms.slice(0, 1).map((p) => platformLabel(p.platform.slug)),
    })),
    answers as QuizAnswers,
    shelfCount,
    beatenCount,
  );

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — nothing to do
    }
  };

  const shareResult = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch {
        // user cancelled
      }
    } else {
      await copyResult();
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-8 sm:py-16">
      <p className="text-xs font-bold tracking-[0.22em] text-orange-600 uppercase">
        Next Play Quiz
      </p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
        What should you play next?
      </h1>
      <p className="mt-4 text-lg text-stone-600">
        Five questions. Six games you&apos;ll actually play. No purchase
        pressure, just the algorithm doing something nice for once.
      </p>

      {phase === "quiz" && (
        <div className="mt-10">
          <div className="mb-5 flex items-center gap-4">
            <span className="text-xs font-bold tracking-[0.14em] text-orange-600 uppercase">
              Question {step + 1} of {QUIZ_QUESTIONS.length}
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-200">
              <div
                className="h-full rounded-full bg-ink transition-all duration-300"
                style={{
                  width: `${((step + 1) / QUIZ_QUESTIONS.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
            {question.title}
          </h2>
          <p className="mt-1.5 text-sm text-stone-500">{question.subtitle}</p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {question.options.map((option) => (
              <button
                key={option.value}
                onClick={() => pick(option.value)}
                className="group flex items-center gap-4 rounded-2xl border border-line bg-card px-4 py-4 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-stone-400 hover:shadow-md hover:shadow-stone-900/5"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-stone-100 text-xl transition-colors group-hover:bg-orange-100">
                  {option.emoji}
                </span>
                <span className="font-semibold text-ink">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === "loading" && (
        <div className="flex flex-col items-center gap-5 py-24 text-stone-500">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-stone-300 border-t-ink" />
          <p>Consulting the game gods…</p>
        </div>
      )}

      {phase === "result" && (
        <div className="mt-10">
          {needsKey ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <p className="font-display text-lg font-bold text-amber-900">
                The quiz needs a RAWG API key to look up games.
              </p>
              <p className="mt-1 text-sm text-amber-900/80">
                Grab a free key at rawg.io/apidocs and add it to the
                RAWG_API_KEY environment variable.
              </p>
            </div>
          ) : games.length === 0 ? (
            <div className="rounded-2xl border border-line bg-card p-12 text-center">
              <p className="text-4xl">🫥</p>
              <p className="mt-4 font-display text-xl font-bold text-ink">
                Even the algorithm is stumped.
              </p>
              <p className="mt-1 text-sm text-stone-600">
                Try different answers — or accept that you play everything.
              </p>
              <button
                onClick={retake}
                className="mt-7 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-stone-800 hover:shadow-lg hover:shadow-stone-900/15"
              >
                Retake the quiz
              </button>
            </div>
          ) : (
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                {MOOD_HEADLINES[answers.mood ?? "chaos"] ?? "Your next plays:"}
              </h2>

              <div className="mt-7 space-y-3.5">
                {games.map((game, i) => (
                  <div
                    key={game.id}
                    className="flex items-center gap-4 rounded-2xl border border-line bg-card p-3.5 transition-all duration-150 hover:border-stone-300 hover:shadow-md hover:shadow-stone-900/5"
                  >
                    <span className="w-7 text-center font-display text-2xl font-bold text-stone-300">
                      {i + 1}
                    </span>
                    <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                      {game.background_image ? (
                        <Image
                          src={game.background_image}
                          alt={game.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xl">
                          🎮
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-[15px] font-bold text-ink">
                        {game.name}
                      </p>
                      <p className="truncate text-xs text-stone-500">
                        {(game.platforms ?? [])
                          .slice(0, 3)
                          .map((p) => platformLabel(p.platform.slug))
                          .join(" · ") || "Multi-platform"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900/90">
                {shelfCount > 0 ? (
                  <p>
                    📦 Fun fact: your shelf has {shelfCount} game
                    {shelfCount === 1 ? "" : "s"} and you&apos;ve beaten{" "}
                    {beatenCount} of them. We&apos;re not counting.
                  </p>
                ) : (
                  <p>
                    📦 Your shelf is empty. Suspicious. Add some games so we can
                    judge your backlog properly.
                  </p>
                )}
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  onClick={copyResult}
                  className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-stone-800 hover:shadow-lg hover:shadow-stone-900/15"
                >
                  {copied ? "Copied!" : "Copy result"}
                </button>
                <button
                  onClick={shareResult}
                  className="rounded-full border border-line-strong bg-card px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-stone-400"
                >
                  Share
                </button>
                <button
                  onClick={retake}
                  className="rounded-full border border-line-strong bg-card px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-stone-400"
                >
                  Retake
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Fetch recommendations, progressively relaxing filters so a picky combo
 * can never empty the result list. Order of relaxation: tags → genres →
 * platforms → no filters at all (top-rated).
 */
async function getRecommendations(
  answers: QuizAnswers,
): Promise<{ games: RawgGame[]; needsKey: boolean }> {
  const fullParams = buildRecQuery(answers);

  // Build attempts from strictest to loosest. Each one clears a filter.
  // The final { } is a guaranteed non-empty fallback (top-rated games).
  // (undefined clears a key — stripped out below before fetching.)
  const attempts: { params: Record<string, string | undefined>; notes: string }[] = [
    { params: fullParams, notes: "full" },
    { params: { ...fullParams, tags: undefined }, notes: "no tags" },
    {
      params: { ...fullParams, tags: undefined, genres: undefined },
      notes: "no tags/genres",
    },
    {
      params: {
        ...fullParams,
        tags: undefined,
        genres: undefined,
        platforms: undefined,
      },
      notes: "no tags/genres/platforms",
    },
    { params: {}, notes: "top-rated" },
  ];

  // Dedupe by query string so identical attempts collapse (e.g. all "any" answers).
  const seen = new Set<string>();
  const uniqueAttempts: { params: Record<string, string | undefined>; notes: string }[] = [];
  for (const attempt of attempts) {
    const clean: Record<string, string | undefined> = {};
    for (const [k, v] of Object.entries(attempt.params)) {
      if (v !== undefined) clean[k] = v;
    }
    const key = new URLSearchParams(clean as Record<string, string>).toString();
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueAttempts.push({ params: clean, notes: attempt.notes });
  }

  let candidates: RawgGame[] = [];
  let needsKey = false;

  for (const { params } of uniqueAttempts) {
    const res = await fetch(
      `/api/recommend?${new URLSearchParams(
        params as Record<string, string>,
      ).toString()}`,
    );
    let data: { games?: RawgGame[]; needsKey?: boolean } = {};
    try {
      data = (await res.json()) as { games?: RawgGame[]; needsKey?: boolean };
    } catch {
      continue;
    }

    needsKey = Boolean(data.needsKey);
    if (needsKey) break; // no point retrying without a key
    candidates = data.games ?? [];
    if (candidates.length > 0) break;
  }

  const limit = playtimeLimit(answers.time);
  let picked: RawgGame[] = [];

  const MAX = 6;
  if (limit !== null) {
    const eligible = candidates.filter(
      (g) => g.playtime === 0 || g.playtime <= limit,
    );
    picked = eligible.slice(0, MAX);
    // Top up from the full list if the time filter was too strict.
    for (const g of candidates) {
      if (picked.length >= MAX) break;
      if (!picked.some((p) => p.id === g.id)) picked.push(g);
    }
  } else {
    picked = candidates.slice(0, MAX);
  }

  return { games: picked, needsKey };
}
