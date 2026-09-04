import { NextRequest } from "next/server";
import {
  fetchGames,
  getApiKey,
  windowDates,
  type ReleaseWindow,
} from "@/lib/rawg";

export const revalidate = 3600;

const VALID_WINDOWS: ReleaseWindow[] = ["today", "week", "month"];

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const windowParam = sp.get("window");
  const window: ReleaseWindow = VALID_WINDOWS.includes(windowParam as ReleaseWindow)
    ? (windowParam as ReleaseWindow)
    : "week";

  if (!getApiKey()) {
    return Response.json({ games: [], needsKey: true });
  }

  const { start, end } = windowDates(window);
  const params: Record<string, string> = {
    dates: `${start},${end}`,
    ordering: "-released",
  };

  const platforms = sp.get("platforms");
  if (platforms) params.platforms = platforms;

  const genres = sp.get("genres");
  if (genres) params.genres = genres;

  try {
    const games = await fetchGames(params, 24);
    return Response.json({ games: games ?? [] });
  } catch {
    return Response.json(
      { games: [], error: "RAWG request failed" },
      { status: 502 },
    );
  }
}