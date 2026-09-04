"use client";

export type AnimeStatus = "watching" | "planned" | "completed" | "dropped";

export const ANIME_STATUS_LABELS: Record<AnimeStatus, string> = {
  watching: "Watching",
  planned: "Plan to Watch",
  completed: "Completed",
  dropped: "Dropped",
};

export const ANIME_STATUS_ORDER: AnimeStatus[] = [
  "watching",
  "planned",
  "completed",
  "dropped",
];

export type AnimeShelfEntry = {
  id: number;
  name: string;
  image: string | null;
  aired: string | null;
  status: AnimeStatus;
  addedAt: number;
};

export type AnimeShelfItem = {
  id: number;
  name: string;
  image: string | null;
  aired: string | null;
};

const STORAGE_KEY = "nextplay.anime-shelf.v1";

let cache: AnimeShelfEntry[] | null = null;
const listeners = new Set<() => void>();

export function loadAnimeShelf(): AnimeShelfEntry[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as AnimeShelfEntry[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function persist(entries: AnimeShelfEntry[]) {
  cache = entries;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // storage full or unavailable — keep in-memory state
  }
  listeners.forEach((listener) => listener());
}

export function subscribeAnime(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Add an anime, change its status, or toggle it off the watchlist. */
export function upsertAnimeEntry(item: AnimeShelfItem, status: AnimeStatus) {
  const entries = loadAnimeShelf();
  const existing = entries.find((e) => e.id === item.id);

  if (!existing) {
    persist([
      {
        id: item.id,
        name: item.name,
        image: item.image,
        aired: item.aired,
        status,
        addedAt: Date.now(),
      },
      ...entries,
    ]);
    return;
  }

  if (existing.status === status) {
    persist(entries.filter((e) => e.id !== item.id));
  } else {
    persist(entries.map((e) => (e.id === item.id ? { ...e, status } : e)));
  }
}

export function removeAnimeEntry(id: number) {
  persist(loadAnimeShelf().filter((e) => e.id !== id));
}

export function exportAnimeShelfJson(): string {
  return JSON.stringify(loadAnimeShelf(), null, 2);
}

export function importAnimeShelfJson(json: string): boolean {
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) return false;
    const valid = parsed.filter(
      (e): e is AnimeShelfEntry =>
        !!e &&
        typeof e.id === "number" &&
        typeof e.name === "string" &&
        ANIME_STATUS_ORDER.includes(e.status),
    );
    persist(valid);
    return true;
  } catch {
    return false;
  }
}