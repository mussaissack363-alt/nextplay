import { NextRequest } from "next/server";
import {
  fetchGames,
  getApiKey,
  windowDates,
  type ReleaseWindow,
} from "@/lib/rawg";

export const revalidate = 3600;

const VALID_WINDOWS: ReleaseWindow[] = ["today", "week", "month"];

const PAGE_SIZE = 40; // RAWG caps page_size at 40

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const windowParam = sp.get("window");
  const window: ReleaseWindow = VALID_WINDOWS.includes(windowParam as ReleaseWindow)
    ? (windowParam as ReleaseWindow)
    : "week";

  const pageParam = Number(sp.get("page") ?? "1");
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  if (!getApiKey()) {
    return Response.json({ games: [], needsKey: true });
  }

  const { start, end } = windowDates(window);
  const params: Record<string, string> = {
    dates: `${start},${end}`,
    ordering: "-released",
    page: String(page),
  };

  const platforms = sp.get("platforms");
  if (platforms) params.platforms = platforms;

  const genres = sp.get("genres");
  if (genres) params.genres = genres;

  try {
    const games = (await fetchGames(params, PAGE_SIZE)) ?? [];
    const hasMore = games.length === PAGE_SIZE;
    return Response.json({ games, page, hasMore });
  } catch {
    // RAWG 404s with "Invalid page" when you page past the last result —
    // for page > 1 that just means "no more", not a real failure.
    if (page > 1) {
      return Response.json({ games: [], page, hasMore: false });
    }
    return Response.json(
      { games: [], error: "RAWG request failed" },
      { status: 502 },
    );
  }
}