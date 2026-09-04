import Image from "next/image";
import { formatReleaseDate, platformLabel, type RawgGame } from "@/lib/rawg";
import ShelfButton from "./ShelfButton";

function scoreStyle(score: number): string {
  if (score >= 75) return "bg-emerald-600";
  if (score >= 55) return "bg-amber-500";
  return "bg-rose-500";
}

export default function GameCard({ game }: { game: RawgGame }) {
  const mc = game.metacritic;
  const platforms = [
    ...new Set(
      (game.platforms ?? [])
        .slice(0, 5)
        .map((p) => platformLabel(p.platform.slug)),
    ),
  ].slice(0, 3);
  const genre = (game.genres ?? [])[0]?.name;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-stone-300 hover:shadow-xl">
      <div className="relative h-44 w-full overflow-hidden bg-stone-100 sm:h-48">
        {game.background_image ? (
          <Image
            src={game.background_image}
            alt={game.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-stone-200 to-stone-300 text-4xl">
            🎮
          </div>
        )}
        {mc !== null && mc !== undefined && (
          <span
            className={`absolute top-3 right-3 rounded-full px-2.5 py-1 text-[10px] font-bold text-white shadow-md ${scoreStyle(mc)}`}
            title="Metacritic score"
          >
            {mc}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="leading-snug font-bold text-lg text-stone-950 transition-colors group-hover:text-orange-600 line-clamp-2">
          {game.name}
        </h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-stone-500">
          <span>{formatReleaseDate(game.released)}</span>
          {platforms.length > 0 && (
            <>
              <span className="text-stone-300">•</span>
              {platforms.map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center rounded bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-700"
                >
                  {p}
                </span>
              ))}
            </>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3 text-xs font-semibold">
          <span className="text-stone-400">{genre ?? "Upcoming"}</span>
          <ShelfButton
            game={{
              id: game.id,
              name: game.name,
              background_image: game.background_image,
              released: game.released,
            }}
          />
        </div>
      </div>
    </article>
  );
}
