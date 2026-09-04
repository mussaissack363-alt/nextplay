"use client";

import { useEffect, useState } from "react";
import {
  loadShelf,
  removeEntry,
  subscribe,
  upsertEntry,
  type ShelfEntry,
  type ShelfGame,
  type ShelfStatus,
} from "@/lib/shelf";

export function useShelf() {
  const [entries, setEntries] = useState<ShelfEntry[]>([]);

  useEffect(() => {
    setEntries(loadShelf());
    return subscribe(() => setEntries(loadShelf()));
  }, []);

  return {
    entries,
    add: (game: ShelfGame, status: ShelfStatus) => upsertEntry(game, status),
    remove: (id: number) => removeEntry(id),
  };
}