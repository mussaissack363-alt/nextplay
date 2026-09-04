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

## Deploy (GitHub Pages)

The site is a static export (`.github/workflows/deploy.yml` builds it and
publishes to GitHub Pages). All RAWG/AniList data is fetched at build time and
baked into the pages, then rebuilt every day at 05:00 UTC so the Vault picks
and release windows stay fresh.

1. Push this repo to GitHub.
2. Add your key as a repo secret so the build can fetch data:
   ```bash
   gh secret set RAWG_API_KEY -b "$(grep RAWG_API_KEY .env.local | cut -d= -f2)"
   ```
3. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Push to `main` (or run the **Deploy to GitHub Pages** workflow manually) —
   the site lands at `https://<owner>.github.io/nextplay/`.

Using a custom domain? Set `NEXT_PUBLIC_BASE_PATH` and `NEXT_PUBLIC_SITE_URL`
in the workflow to match.

## Stack

- Next.js 16 (App Router, server components, static export)
- Tailwind CSS v4
- Client-side shelf stored in `localStorage` (no database needed for v1)