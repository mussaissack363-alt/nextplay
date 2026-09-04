export type QuizAnswers = {
  platform: string;
  genre: string;
  time: string;
  players: string;
  mood: string;
};

export type QuizOption = { value: string; label: string; emoji: string };

export type QuizQuestion = {
  id: keyof QuizAnswers;
  title: string;
  subtitle: string;
  options: QuizOption[];
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "platform",
    title: "Where do you game?",
    subtitle: "Be honest, this affects everything.",
    options: [
      { value: "pc", label: "PC", emoji: "🖥️" },
      { value: "ps5", label: "PlayStation", emoji: "🎮" },
      { value: "xbox", label: "Xbox", emoji: "❎" },
      { value: "switch", label: "Switch", emoji: "🍄" },
      { value: "any", label: "I play everything", emoji: "🌍" },
    ],
  },
  {
    id: "genre",
    title: "Pick your poison",
    subtitle: "The genre you always come crawling back to.",
    options: [
      { value: "action", label: "Action / fighting", emoji: "🥊" },
      { value: "rpg", label: "RPG / grind my life away", emoji: "📜" },
      { value: "shooter", label: "Shooter", emoji: "🔫" },
      { value: "adventure", label: "Adventure / exploration", emoji: "🗺️" },
      { value: "strategy", label: "Strategy / puzzle", emoji: "🧠" },
      { value: "sports", label: "Sports / racing", emoji: "🏎️" },
      { value: "anything", label: "I'm not picky", emoji: "🤷" },
    ],
  },
  {
    id: "time",
    title: "How much time do you actually have?",
    subtitle: "Not what you tell yourself. What you actually have.",
    options: [
      { value: "short", label: "30 minutes, tops", emoji: "⏰" },
      { value: "medium", label: "A couple of hours", emoji: "🌆" },
      { value: "long", label: "I have no responsibilities", emoji: "🛋️" },
      { value: "anytime", label: "Time is a construct", emoji: "🌀" },
    ],
  },
  {
    id: "players",
    title: "Solo or social?",
    subtitle: "No wrong answers. Some are just more lonely.",
    options: [
      { value: "solo", label: "Solo. People are scary", emoji: "🧍" },
      { value: "coop", label: "Co-op with friends", emoji: "🤝" },
      { value: "multi", label: "I want to beat strangers", emoji: "⚔️" },
      { value: "any", label: "Whatever happens, happens", emoji: "🎲" },
    ],
  },
  {
    id: "mood",
    title: "What's the vibe?",
    subtitle: "Last question. Make it count.",
    options: [
      { value: "challenge", label: "Make me suffer (in a good way)", emoji: "😤" },
      { value: "story", label: "Make me feel things", emoji: "😭" },
      { value: "relax", label: "Chill vibes only", emoji: "🌴" },
      { value: "chaos", label: "CHAOS", emoji: "🔥" },
    ],
  },
];

const PLATFORM_IDS: Record<string, number[]> = {
  pc: [4],
  ps5: [187, 18],
  xbox: [186, 1],
  switch: [7],
  any: [],
};

const GENRE_SLUGS: Record<string, string[]> = {
  action: ["action", "fighting"],
  rpg: ["role-playing-games-rpg"],
  shooter: ["shooter"],
  adventure: ["adventure"],
  strategy: ["strategy", "puzzle"],
  sports: ["sports", "racing"],
  anything: [],
};

const PLAYER_TAGS: Record<string, string[]> = {
  solo: ["singleplayer"],
  coop: ["co-op"],
  multi: ["multiplayer"],
  any: [],
};

const MOOD_TAGS: Record<string, string[]> = {
  challenge: ["hard"],
  story: ["story-rich"],
  relax: ["relaxing"],
  chaos: [],
};

/** Turn quiz answers into RAWG query params. */
export function buildRecQuery(answers: QuizAnswers): Record<string, string> {
  const params: Record<string, string> = {};

  const platforms = PLATFORM_IDS[answers.platform] ?? [];
  if (platforms.length > 0) params.platforms = platforms.join(",");

  const genres = GENRE_SLUGS[answers.genre] ?? [];
  if (genres.length > 0) params.genres = genres.join(",");

  const tags = [
    ...(PLAYER_TAGS[answers.players] ?? []),
    ...(MOOD_TAGS[answers.mood] ?? []),
  ];
  if (tags.length > 0) params.tags = tags.join(",");

  return params;
}

/** Max hours a game should take, based on the time answer (null = no limit). */
export function playtimeLimit(time: string): number | null {
  if (time === "short") return 10;
  if (time === "medium") return 40;
  return null;
}

export const MOOD_HEADLINES: Record<string, string> = {
  challenge: "You like pain. Here's your prescribed suffering:",
  story: "You're here for the feels. No judgment. Mostly.",
  relax: "You deserve nice things. You also deserve these games:",
  chaos: "CHAOS MODE ENGAGED. These will absolutely escalate:",
};

export function buildShareText(
  games: { name: string; platforms: string[] }[],
  answers: QuizAnswers,
  shelfCount: number,
  beatenCount: number,
): string {
  const lines = games.map(
    (g, i) => `${i + 1}. ${g.name}${g.platforms.length > 0 ? ` (${g.platforms[0]})` : ""}`,
  );
  const funFact =
    shelfCount > 0
      ? `Fun fact: my shelf has ${shelfCount} game${shelfCount === 1 ? "" : "s"} and I've beaten ${beatenCount} of them. We're not counting.`
      : "My backlog is a sacred space and I will not be discussing it.";
  return [
    `My NextPlay picks:`,
    ...lines,
    "",
    funFact,
    "",
    "Find yours at nextplay.app",
  ].join("\n");
}