const RAWG_BASE = "https://api.rawg.io/api";

export type RawgPlatform = { id: number; slug: string; name: string };

export type RawgGame = {
  id: number;
  slug: string;
  name: string;
  released: string | null;
  background_image: string | null;
  metacritic: number | null;
  rating: number;
  playtime: number;
  genres: { id: number; slug: string; name: string }[];
  platforms: { platform: RawgPlatform }[];
  esrb_rating: { name: string } | null;
};

export type ReleaseWindow = "today" | "week" | "month";

export const PLATFORMS: { id: number; slug: string; label: string }[] = [
  { id: 4, slug: "pc", label: "PC" },
  { id: 187, slug: "playstation5", label: "PS5" },
  { id: 186, slug: "xbox-series-x", label: "Xbox Series" },
  { id: 7, slug: "nintendo-switch", label: "Switch" },
  { id: 18, slug: "playstation4", label: "PS4" },
  { id: 1, slug: "xbox-one", label: "Xbox One" },
];

export const GENRES: { slug: string; label: string }[] = [
  { slug: "action", label: "Action" },
  { slug: "role-playing-games-rpg", label: "RPG" },
  { slug: "shooter", label: "Shooter" },
  { slug: "adventure", label: "Adventure" },
  { slug: "strategy", label: "Strategy" },
  { slug: "puzzle", label: "Puzzle" },
  { slug: "platformer", label: "Platformer" },
  { slug: "racing", label: "Racing" },
  { slug: "sports", label: "Sports" },
  { slug: "fighting", label: "Fighting" },
  { slug: "simulation", label: "Simulation" },
  { slug: "indie", label: "Indie" },
];

export function getApiKey(): string | null {
  const key = process.env.RAWG_API_KEY;
  return key && key.trim().length > 0 ? key.trim() : null;
}

/** Date range for the release radar windows, in YYYY-MM-DD pairs. */
/** First and last day of a calendar month, as YYYY-MM-DD pairs. */
export function monthWindow(
  year: number,
  month: number,
): { start: string; end: string } {
  const last = new Date(year, month, 0); // month is 1-12; day 0 = last day of month
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return {
    start: `${year}-${String(month).padStart(2, "0")}-01`,
    end: fmt(last),
  };
}

/** Shift a (year, month) pair by delta months, handling year rollovers. */
export function monthOffset(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const d = new Date(year, month - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

/** "September 2026" style label. */
export function monthLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function windowDates(window: ReleaseWindow): { start: string; end: string } {
  const now = new Date();
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  if (window === "today") {
    return { start: fmt(now), end: fmt(now) };
  }

  if (window === "week") {
    const end = new Date(now);
    end.setDate(now.getDate() + 7);
    return { start: fmt(now), end: fmt(end) };
  }

  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start: fmt(now), end: fmt(end) };
}

/**
 * Fetch games from RAWG. Returns null when the API key is missing
 * (pages render a setup banner in that case), [] on empty results.
 * Responses are cached for an hour via ISR so we don't hammer the API.
 */
export async function fetchGames(
  params: Record<string, string | number>,
  pageSize = 24,
): Promise<RawgGame[] | null> {
  const key = getApiKey();
  if (!key) return null;

  const query = new URLSearchParams();
  query.set("key", key);
  query.set("page_size", String(pageSize));
  for (const [k, v] of Object.entries(params)) query.set(k, String(v));

  const res = await fetch(`${RAWG_BASE}/games?${query.toString()}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`RAWG request failed: ${res.status}`);

  const data = (await res.json()) as { results?: RawgGame[] };
  const results = data.results ?? [];

  // RAWG occasionally returns null for fields the schema lists as arrays.
  // Normalize so every consumer can trust these to be arrays.
  return results.map((g) => ({
    ...g,
    platforms: Array.isArray(g.platforms) ? g.platforms : [],
    genres: Array.isArray(g.genres) ? g.genres : [],
  }));
}

/**
 * Fetch up to `max` games, paginating through RAWG (page_size is capped at 40).
 */
export async function fetchAllGames(
  params: Record<string, string | number>,
  max = 80,
): Promise<RawgGame[]> {
  const key = getApiKey();
  if (!key) return [];

  const out: RawgGame[] = [];
  for (let page = 1; page <= Math.ceil(max / 40); page++) {
    const batch = (await fetchGames({ ...params, page }, 40)) ?? [];
    out.push(...batch);
    if (batch.length < 40 || out.length >= max) break;
  }
  return out.slice(0, max);
}

const PLATFORM_LABELS: Record<string, string> = {
  pc: "PC",
  playstation5: "PS5",
  playstation4: "PS4",
  playstation3: "PS3",
  playstation2: "PS2",
  playstation: "PlayStation",
  "playstation-vita": "PS Vita",
  psp: "PSP",
  "xbox-series-x": "Xbox",
  "xbox-series-s": "Xbox",
  "xbox-one": "Xbox One",
  xbox360: "Xbox 360",
  "xbox-old": "Xbox",
  "nintendo-switch": "Switch",
  wiiu: "Wii U",
  wii: "Wii",
  "nintendo-3ds": "3DS",
  "nintendo-ds": "DS",
  "game-boy-advance": "GBA",
  "nintendo-64": "N64",
  "super-nintendo": "SNES",
  nes: "NES",
  "game-boy-color": "GBC",
  "game-boy": "GB",
  ios: "iOS",
  android: "Android",
  macos: "macOS",
  linux: "Linux",
  web: "Web",
  "sega-master-system": "Master System",
  "sega-mega-drive": "Mega Drive",
  "sega-saturn": "Saturn",
  dreamcast: "Dreamcast",
  "neo-geo": "Neo Geo",
  "atari-7800": "Atari 7800",
};

export function platformLabel(slug: string): string {
  const known = PLATFORM_LABELS[slug];
  if (known) return known;
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatReleaseDate(iso: string | null): string {
  if (!iso) return "TBA";
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}