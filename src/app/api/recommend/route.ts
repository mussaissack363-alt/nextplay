import { NextRequest } from "next/server";
import { fetchGames, getApiKey } from "@/lib/rawg";

export const revalidate = 3600;

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  if (!getApiKey()) {
    return Response.json({ games: [], needsKey: true });
  }

  const params: Record<string, string> = {
    ordering: "-rating",
  };

  for (const key of ["platforms", "genres", "tags"]) {
    const value = sp.get(key);
    if (value) params[key] = value;
  }

  try {
    const games = await fetchGames(params, 30);
    return Response.json({ games: games ?? [] });
  } catch {
    return Response.json(
      { games: [], error: "RAWG request failed" },
      { status: 502 },
    );
  }
}