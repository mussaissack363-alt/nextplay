"use client";

import { useEffect, useState } from "react";
import {
  loadAnimeShelf,
  removeAnimeEntry,
  subscribeAnime,
  upsertAnimeEntry,
  type AnimeShelfEntry,
  type AnimeShelfItem,
  type AnimeStatus,
} from "@/lib/anime-shelf";

export function useAnimeShelf() {
  const [entries, setEntries] = useState<AnimeShelfEntry[]>([]);

  useEffect(() => {
    setEntries(loadAnimeShelf());
    return subscribeAnime(() => setEntries(loadAnimeShelf()));
  }, []);

  return {
    entries,
    add: (item: AnimeShelfItem, status: AnimeStatus) =>
      upsertAnimeEntry(item, status),
    remove: (id: number) => removeAnimeEntry(id),
  };
}