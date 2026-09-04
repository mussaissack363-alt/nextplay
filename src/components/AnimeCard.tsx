import Image from "next/image";
import { airStatus, formatAired, type Anime } from "@/lib/anime";
import AnimeShelfButton from "./AnimeShelfButton";

function scoreColor(score: number): string {
  if (score >= 8) return "bg-emerald-600";
  if (score >= 7) return "bg-amber-500";
  return "bg-rose-500";
}

const STATUS_PILL: Record<ReturnType<typeof airStatus>, string> = {
  airing: "bg-emerald-100 text-emerald-700",
  finished: "bg-stone-100 text-stone-600",
  upcoming: "bg-amber-100 text-amber-700",
};

export default function AnimeCard({ anime }: { anime: Anime }) {
  const status = airStatus(anime);
  const genres = anime.genres.slice(0, 3).map((g) => g.name);
  const studio = anime.studios[0]?.name;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-stone-300 hover:shadow-xl">
      <div className="relative h-48 w-full overflow-hidden bg-stone-100">
        {anime.image ? (
          <Image
            src={anime.image}
            alt={anime.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-stone-200 to-stone-300 text-4xl">
            🎬
          </div>
        )}
        {anime.score != null && (
          <span
            className={`absolute top-3 right-3 rounded-full px-2.5 py-1 text-[10px] font-bold text-white shadow-md ${scoreColor(anime.score)}`}
            title="Community score"
          >
            ★ {anime.score.toFixed(1)}
          </span>
        )}
        <span
          className={`absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow-sm ${STATUS_PILL[status]}`}
        >
          {status === "airing"
            ? "● Airing now"
            : status === "upcoming"
              ? "Upcoming"
              : "Finished"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="leading-snug font-bold text-lg text-stone-950 transition-colors group-hover:text-orange-600 line-clamp-2">
          {anime.title}
        </h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-stone-500">
          <span>
            {anime.type ?? "TV"}
            {anime.episodes != null ? ` · ${anime.episodes} eps` : ""}
          </span>
          <span className="text-stone-300">•</span>
          <span>{formatAired(anime.aired_from)}</span>
          {studio && (
            <>
              <span className="text-stone-300">•</span>
              <span className="truncate">{studio}</span>
            </>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {genres.map((g) => (
            <span
              key={g}
              className="inline-flex items-center rounded bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-700"
            >
              {g}
            </span>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3 text-xs font-semibold">
          <span className="text-stone-400">
            {genres[0] ?? anime.type ?? "Anime"}
          </span>
          <AnimeShelfButton
            anime={{
              id: anime.id,
              name: anime.title,
              image: anime.image,
              aired: anime.aired_from,
            }}
          />
        </div>
      </div>
    </article>
  );
}