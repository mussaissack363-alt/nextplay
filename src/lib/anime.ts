export type AnimeGenre = { id: number; name: string };
export type AnimeStudio = { id: number; name: string };

export type Anime = {
  id: number;
  title: string;
  title_english: string | null;
  image: string | null;
  score: number | null; // normalized 0-10
  episodes: number | null;
  status: string;
  aired_from: string | null;
  year: number | null;
  type: string | null;
  genres: AnimeGenre[];
  studios: AnimeStudio[];
  synopsis: string | null;
};

/* ------------------------------------------------------------------ */
/* AniList (primary — proper GraphQL API, no key, no scraping)         */
/* ------------------------------------------------------------------ */

type AnilistMedia = {
  id?: number;
  title?: { romaji?: string | null; english?: string | null } | null;
  coverImage?: { large?: string | null; extraLarge?: string | null } | null;
  averageScore?: number | null;
  episodes?: number | null;
  status?: string | null;
  startDate?: { year?: number | null; month?: number | null; day?: number | null } | null;
  format?: string | null;
  genres?: string[] | null;
  studios?: { nodes?: { id?: number; name?: string }[] | null } | null;
};

/** Anime-industry seasons: Jan–Mar Winter, Apr–Jun Spring, Jul–Sep Summer, Oct–Dec Fall. */
function seasonParts(month: number, year: number): { season: string; year: number } {
  if (month <= 2) return { season: "WINTER", year };
  if (month <= 5) return { season: "SPRING", year };
  if (month <= 8) return { season: "SUMMER", year };
  return { season: "FALL", year };
}

function anilistSeason(now: Date): { season: string; year: number } {
  return seasonParts(now.getMonth(), now.getFullYear());
}

const ANILIST_STATUS: Record<string, string> = {
  RELEASING: "Currently Airing",
  FINISHED: "Finished Airing",
  NOT_YET_RELEASED: "Not yet aired",
  CANCELLED: "Cancelled",
  HIATUS: "On Hiatus",
};

function normalizeAnilist(raw: AnilistMedia): Anime {
  const d = raw.startDate;
  const aired =
    d?.year && d?.month
      ? `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day ?? 1).padStart(2, "0")}`
      : null;
  const score = raw.averageScore != null ? raw.averageScore / 10 : null;
  return {
    id: raw.id ?? 0,
    title: raw.title?.romaji ?? raw.title?.english ?? "Untitled",
    title_english: raw.title?.english ?? null,
    image: raw.coverImage?.extraLarge ?? raw.coverImage?.large ?? null,
    score,
    episodes: raw.episodes ?? null,
    status: ANILIST_STATUS[raw.status ?? ""] ?? raw.status ?? "Unknown",
    aired_from: aired,
    year: d?.year ?? null,
    type: raw.format ?? null,
    genres: Array.isArray(raw.genres)
      ? raw.genres.map((g, i) => ({ id: i, name: g }))
      : [],
    studios: Array.isArray(raw.studios?.nodes)
      ? raw.studios!.nodes!.map((s) => ({ id: s.id ?? 0, name: s.name ?? "Unknown" }))
      : [],
    synopsis: null,
  };
}

async function fetchAnilist(max: number): Promise<Anime[]> {
  const { season, year } = anilistSeason(new Date());
  const query = `
    query Seasonal($season: MediaSeason, $seasonYear: Int, $perPage: Int) {
      Page(perPage: $perPage) {
        media(season: $season, seasonYear: $seasonYear, type: ANIME, sort: POPULARITY_DESC, isAdult: false) {
          id
          title { romaji english }
          coverImage { large extraLarge }
          averageScore
          episodes
          status
          startDate { year month day }
          format
          genres
          studios(isMain: true) { nodes { id name } }
        }
      }
    }`;
  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      variables: { season, seasonYear: year, perPage: max },
    }),
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`AniList request failed: ${res.status}`);
  const data = (await res.json()) as {
    data?: { Page?: { media?: AnilistMedia[] } };
  };
  return (data.data?.Page?.media ?? []).map(normalizeAnilist);
}

/* ------------------------------------------------------------------ */
/* Jikan (fallback — MyAnimeList data, occasionally down)              */
/* ------------------------------------------------------------------ */

type JikanAnime = {
  mal_id?: number;
  title?: string | null;
  title_english?: string | null;
  images?: { jpg?: { large_image_url?: string | null } } | null;
  score?: number | null;
  episodes?: number | null;
  status?: string | null;
  aired?: { from?: string | null } | null;
  year?: number | null;
  type?: string | null;
  genres?: { mal_id?: number; name?: string }[] | null;
  studios?: { mal_id?: number; name?: string }[] | null;
  synopsis?: string | null;
};

function normalizeJikan(raw: JikanAnime): Anime {
  return {
    id: raw.mal_id ?? 0,
    title: raw.title ?? raw.title_english ?? "Untitled",
    title_english: raw.title_english ?? null,
    image: raw.images?.jpg?.large_image_url ?? null,
    score: raw.score ?? null,
    episodes: raw.episodes ?? null,
    status: raw.status ?? "Unknown",
    aired_from: raw.aired?.from ?? null,
    year: raw.year ?? null,
    type: raw.type ?? null,
    genres: Array.isArray(raw.genres)
      ? raw.genres.map((g) => ({ id: g.mal_id ?? 0, name: g.name ?? "Unknown" }))
      : [],
    studios: Array.isArray(raw.studios)
      ? raw.studios.map((s) => ({ id: s.mal_id ?? 0, name: s.name ?? "Unknown" }))
      : [],
    synopsis: raw.synopsis ?? null,
  };
}

async function fetchJikan(max: number): Promise<Anime[]> {
  const query = new URLSearchParams({ sfw: "true", limit: "25", order_by: "score" });
  const res = await fetch(`https://api.jikan.moe/v4/seasons/now?${query.toString()}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Jikan request failed: ${res.status}`);
  const data = (await res.json()) as { data?: JikanAnime[] };
  return (data.data ?? []).map(normalizeJikan).slice(0, max);
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

/**
 * Fetch what's airing this season. AniList first (reliable), Jikan as a
 * fallback when AniList is unavailable. Cached for an hour via ISR.
 */
export async function fetchSeasonalAnime(max = 24): Promise<Anime[]> {
  try {
    return await fetchAnilist(max);
  } catch {
    try {
      return await fetchJikan(max);
    } catch {
      throw new Error("Both anime sources (AniList, Jikan) are unavailable");
    }
  }
}

/** "Summer 2026"-style label for the current anime season. */
export function currentSeasonLabel(now = new Date()): string {
  const { season, year } = seasonParts(now.getMonth(), now.getFullYear());
  return `${season.charAt(0) + season.slice(1).toLowerCase()} ${year}`;
}

export function airStatus(anime: Anime): "airing" | "finished" | "upcoming" {
  const s = anime.status.toLowerCase();
  if (s.includes("airing")) return "airing";
  if (s.includes("upcoming") || s.includes("not yet")) return "upcoming";
  return "finished";
}

export function formatAired(iso: string | null): string {
  if (!iso) return "Date TBA";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Date TBA";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}