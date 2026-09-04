import { fetchAllGames, type RawgGame } from "./rawg";

/**
 * The Vault — older, well-rated games worth revisiting.
 *
 * RAWG's catalog spans decades, so we pull a broad pool of highly-rated
 * titles released before a cutoff year, then pick a deterministic slice
 * based on the current date. Everyone sees the same picks on the same day,
 * and the rotation changes daily (5 picks) and monthly (1 spotlight).
 */

const OLDEST = "1970-01-01";
const CUTOFF = "2022-12-31"; // a few years old = "older", not museum pieces
const MIN_RATING = 3.8; // RAWG community rating out of 5

/** Deterministic PRNG (mulberry32) so a seed always yields the same picks. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  const rand = mulberry32(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Whole days since the Unix epoch — changes at midnight UTC. */
export function daySeed(now = new Date()): number {
  return Math.floor(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000,
  );
}

/** Months since year 0 — changes at the start of each month. */
export function monthSeed(now = new Date()): number {
  return now.getFullYear() * 12 + now.getMonth();
}

/** Label for today's rotation, e.g. "Wednesday, September 9". */
export function vaultDayLabel(now = new Date()): string {
  return now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** Label for the monthly spotlight, e.g. "September 2026". */
export function vaultMonthLabel(now = new Date()): string {
  return now.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

/**
 * Fetch the pool of older, well-rated games. Cached for an hour (ISR) so
 * the selection stays stable within the day but data isn't hammered.
 */
export async function fetchOlderPool(max = 120): Promise<RawgGame[]> {
  const raw = await fetchAllGames(
    {
      dates: `${OLDEST},${CUTOFF}`,
      ordering: "-rating",
    },
    max,
  );
  // Dedupe (RAWG can repeat entries across pages) and keep the well-rated.
  const seen = new Set<number>();
  const pool: RawgGame[] = [];
  for (const g of raw) {
    if (seen.has(g.id)) continue;
    seen.add(g.id);
    if (g.rating >= MIN_RATING) pool.push(g);
  }
  return pool;
}

/** Today's 5 picks — deterministic per day, shuffled for variety. */
export function dailyVaultPicks(
  pool: RawgGame[],
  seed: number = daySeed(),
  count = 5,
): RawgGame[] {
  if (pool.length === 0) return [];
  return seededShuffle(pool, seed).slice(0, Math.min(count, pool.length));
}

/** The monthly spotlight pick — deterministic per month. */
export function monthlyVaultPick(
  pool: RawgGame[],
  seed: number = monthSeed(),
): RawgGame | null {
  if (pool.length === 0) return null;
  return pool[seed % pool.length];
}