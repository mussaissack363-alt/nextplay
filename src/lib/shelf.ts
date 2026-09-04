"use client";

export type ShelfStatus = "playing" | "want" | "beaten" | "dropped";

export const STATUS_LABELS: Record<ShelfStatus, string> = {
  playing: "Playing",
  want: "Want",
  beaten: "Beaten",
  dropped: "Dropped",
};

export const STATUS_ORDER: ShelfStatus[] = ["playing", "want", "beaten", "dropped"];

export type ShelfEntry = {
  id: number;
  name: string;
  image: string | null;
  released: string | null;
  status: ShelfStatus;
  addedAt: number;
};

export type ShelfGame = {
  id: number;
  name: string;
  background_image: string | null;
  released: string | null;
};

const STORAGE_KEY = "nextplay.shelf.v1";

let cache: ShelfEntry[] | null = null;
const listeners = new Set<() => void>();

export function loadShelf(): ShelfEntry[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as ShelfEntry[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function persist(entries: ShelfEntry[]) {
  cache = entries;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // storage full or unavailable — keep in-memory state
  }
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Add a game, change its status, or toggle it off the shelf. */
export function upsertEntry(game: ShelfGame, status: ShelfStatus) {
  const entries = loadShelf();
  const existing = entries.find((e) => e.id === game.id);

  if (!existing) {
    persist([
      {
        id: game.id,
        name: game.name,
        image: game.background_image,
        released: game.released,
        status,
        addedAt: Date.now(),
      },
      ...entries,
    ]);
    return;
  }

  if (existing.status === status) {
    persist(entries.filter((e) => e.id !== game.id));
  } else {
    persist(entries.map((e) => (e.id === game.id ? { ...e, status } : e)));
  }
}

export function removeEntry(id: number) {
  persist(loadShelf().filter((e) => e.id !== id));
}

export function exportShelfJson(): string {
  return JSON.stringify(loadShelf(), null, 2);
}

export function importShelfJson(json: string): boolean {
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) return false;
    const valid = parsed.filter(
      (e): e is ShelfEntry =>
        !!e &&
        typeof e.id === "number" &&
        typeof e.name === "string" &&
        STATUS_ORDER.includes(e.status),
    );
    persist(valid);
    return true;
  } catch {
    return false;
  }
}