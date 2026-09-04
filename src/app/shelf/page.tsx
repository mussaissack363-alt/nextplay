"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useAnimeShelf } from "@/hooks/useAnimeShelf";
import { useShelf } from "@/hooks/useShelf";
import {
  ANIME_STATUS_LABELS,
  ANIME_STATUS_ORDER,
  exportAnimeShelfJson,
  importAnimeShelfJson,
} from "@/lib/anime-shelf";
import {
  STATUS_LABELS,
  STATUS_ORDER,
  exportShelfJson,
  importShelfJson,
} from "@/lib/shelf";

const GAME_DOT: Record<string, string> = {
  playing: "bg-emerald-500",
  want: "bg-sky-500",
  beaten: "bg-stone-900",
  dropped: "bg-rose-500",
};

const ANIME_DOT: Record<string, string> = {
  watching: "bg-emerald-500",
  planned: "bg-sky-500",
  completed: "bg-stone-900",
  dropped: "bg-rose-500",
};

const GAME_PILL_ON: Record<string, string> = {
  playing: "border-emerald-600 bg-emerald-600 text-white",
  want: "border-sky-600 bg-sky-600 text-white",
  beaten: "border-stone-900 bg-stone-900 text-white",
  dropped: "border-rose-600 bg-rose-600 text-white",
};

const ANIME_PILL_ON: Record<string, string> = {
  watching: "border-emerald-600 bg-emerald-600 text-white",
  planned: "border-sky-600 bg-sky-600 text-white",
  completed: "border-stone-900 bg-stone-900 text-white",
  dropped: "border-rose-600 bg-rose-600 text-white",
};

type Row = {
  id: number;
  name: string;
  image: string | null;
  released: string | null;
  status: string;
  addedAt: number;
};

type Tab = "games" | "anime";

const TABS: { value: Tab; label: string }[] = [
  { value: "games", label: "🎮 Games" },
  { value: "anime", label: "📺 Anime" },
];

export default function ShelfPage() {
  const { entries: games, add: addGame, remove: removeGame } = useShelf();
  const {
    entries: anime,
    add: addAnime,
    remove: removeAnime,
  } = useAnimeShelf();
  const [tab, setTab] = useState<Tab>("games");
  const fileRef = useRef<HTMLInputElement>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  const handleExport = () => {
    const isAnime = tab === "anime";
    const blob = new Blob([isAnime ? exportAnimeShelfJson() : exportShelfJson()], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = isAnime ? "nextplay-anime-shelf.json" : "nextplay-shelf.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (file: File) => {
    const text = await file.text();
    const ok =
      tab === "anime" ? importAnimeShelfJson(text) : importShelfJson(text);
    setImportMessage(
      ok
        ? "Shelf imported. Everything has been relocated."
        : "That file doesn't look like a shelf. Try the export from this site.",
    );
    if (fileRef.current) fileRef.current.value = "";
  };

  const isAnime = tab === "anime";
  const entries: Row[] = (isAnime ? anime : games).map((e) => {
    const released = isAnime
      ? (e as { aired?: string | null }).aired ?? null
      : (e as { released?: string | null }).released ?? null;
    return {
      id: e.id,
      name: e.name,
      image: e.image,
      released,
      status: e.status,
      addedAt: e.addedAt,
    };
  });

  const statusOrder = isAnime ? ANIME_STATUS_ORDER : STATUS_ORDER;
  const statusLabels: Record<string, string> = isAnime
    ? ANIME_STATUS_LABELS
    : STATUS_LABELS;
  const dot = isAnime ? ANIME_DOT : GAME_DOT;
  const pillOn = isAnime ? ANIME_PILL_ON : GAME_PILL_ON;

  const setStatus = (row: Row, status: string) => {
    if (isAnime) {
      addAnime(
        {
          id: row.id,
          name: row.name,
          image: row.image,
          aired: row.released,
        },
        status as Parameters<typeof addAnime>[1],
      );
    } else {
      addGame(
        {
          id: row.id,
          name: row.name,
          background_image: row.image,
          released: row.released,
        },
        status as Parameters<typeof addGame>[1],
      );
    }
  };

  const remove = (id: number) => (isAnime ? removeAnime(id) : removeGame(id));

  const noun = isAnime ? "anime" : "game";
  const total = entries.length;

  const emptyState = isAnime ? (
    <div className="mt-10 rounded-2xl border border-line bg-card p-12 text-center sm:p-16">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-orange-100 text-3xl">
        📺
      </span>
      <p className="mt-6 font-display text-xl font-bold text-ink">
        Your watchlist is empty.
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">
        Either a lie or a miracle. Browse the seasonal lineup and start being
        honest about what you actually finish.
      </p>
      <Link
        href="/anime"
        className="mt-7 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-stone-800 hover:shadow-lg hover:shadow-stone-900/15"
      >
        Find anime to (maybe) finish
      </Link>
    </div>
  ) : (
    <div className="mt-10 rounded-2xl border border-line bg-card p-12 text-center sm:p-16">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-orange-100 text-3xl">
        📦
      </span>
      <p className="mt-6 font-display text-xl font-bold text-ink">
        Your shelf is empty.
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">
        Which is either a lie or a miracle. Add games from the Release Radar and
        start being honest about what you actually finish.
      </p>
      <Link
        href="/releases"
        className="mt-7 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-stone-800 hover:shadow-lg hover:shadow-stone-900/15"
      >
        Find games to (maybe) finish
      </Link>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-8 sm:py-16">
      {/* Tabs */}
      <div className="mb-8 flex w-fit rounded-full border border-line bg-stone-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
              tab === t.value
                ? "bg-card text-ink shadow-sm"
                : "text-stone-500 hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {total === 0 ? (
        <>
          <p className="text-xs font-bold tracking-[0.22em] text-orange-600 uppercase">
            My Shelf{isAnime ? " — Anime" : ""}
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            {isAnime
              ? "Your watchlist, catalogued."
              : "Your backlog, catalogued."}
          </h1>
          {emptyState}
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-bold tracking-[0.22em] text-orange-600 uppercase">
                My Shelf{isAnime ? " — Anime" : ""}
              </p>
              <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
                {total} {noun}
                {total === 1 ? "" : "s"} accounted for.
              </h1>
              <p className="mt-2 text-stone-600">
                Zero judgement. (Some judgement.)
              </p>
            </div>
            <div className="flex gap-2 text-sm">
              <button
                onClick={handleExport}
                className="rounded-full border border-line-strong bg-card px-4 py-2 font-semibold text-ink transition-colors hover:border-stone-400"
              >
                Export
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="rounded-full border border-line-strong bg-card px-4 py-2 font-semibold text-ink transition-colors hover:border-stone-400"
              >
                Import
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImport(file);
                }}
              />
            </div>
          </div>

          {importMessage && (
            <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
              {importMessage}
            </p>
          )}

          <div className="mt-10 space-y-10">
            {statusOrder.map((status) => {
              const group = entries
                .filter((e) => e.status === status)
                .sort((a, b) => b.addedAt - a.addedAt);
              if (group.length === 0) return null;

              return (
                <section key={status}>
                  <h2 className="flex items-center gap-2.5 font-display text-lg font-bold text-ink">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${dot[status]}`}
                      aria-hidden
                    />
                    {statusLabels[status]}
                    <span className="text-sm font-normal text-stone-400">
                      ({group.length})
                    </span>
                  </h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {group.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex gap-4 rounded-2xl border border-line bg-card p-3.5 transition-all duration-200 hover:border-stone-300 hover:shadow-md hover:shadow-stone-900/5"
                      >
                        <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                          {entry.image ? (
                            <Image
                              src={entry.image}
                              alt={entry.name}
                              fill
                              sizes="112px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xl">
                              {isAnime ? "📺" : "🎮"}
                            </div>
                          )}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <p className="truncate font-display text-[15px] font-bold text-ink">
                            {entry.name}
                          </p>
                          <p className="mt-0.5 text-xs text-stone-500">
                            {entry.released?.slice(0, 4) ?? "TBA"}
                          </p>
                          <div className="mt-auto flex flex-wrap items-center gap-1 pt-2">
                            {statusOrder.map((s) => (
                              <button
                                key={s}
                                onClick={() => setStatus(entry, s)}
                                className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                                  s === entry.status
                                    ? pillOn[s]
                                    : "border-transparent text-stone-400 hover:text-ink"
                                }`}
                              >
                                {statusLabels[s]}
                              </button>
                            ))}
                            <button
                              onClick={() => remove(entry.id)}
                              className="ml-auto rounded-full px-1.5 py-0.5 text-sm text-stone-400 transition-colors hover:text-rose-600"
                              aria-label={`Remove ${entry.name} from shelf`}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}