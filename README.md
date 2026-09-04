# NextPlay 🎮

Your gaming sidekick: a release radar, a backlog shelf, and a quiz that finds
your next play. Built with Next.js + Tailwind, powered by the free
[RAWG](https://rawg.io/apidocs) game database.

## Pages

- **/** — home with this week's drops
- **/releases** — Release Radar: today / this week / this month, filterable by
  platform and genre
- **/shelf** — backlog tracker (saved in your browser, with export/import)
- **/quiz** — five questions, three games you'll actually play, shareable verdict

## Setup

```bash
npm install
# Get a free key at https://rawg.io/apidocs, then:
cp .env.example .env.local   # paste your key into RAWG_API_KEY
npm run dev                  # http://localhost:3000
```

## Deploy

1. Push this repo to GitHub.
2. Import it in Vercel — the Next.js build is detected automatically.
3. Add `RAWG_API_KEY` under Project Settings → Environment Variables.
4. Deploy. That's it.

## Stack

- Next.js 16 (App Router, server components + ISR caching for the RAWG calls)
- Tailwind CSS v4
- Client-side shelf stored in `localStorage` (no database needed for v1)