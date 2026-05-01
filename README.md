# shellylynnx.com

Personal site for Shelly Xiong. NYC birder, illustrator, and developer.

Live at [shellylynnx.com](https://shellylynnx.com).

## Stack

- **Astro 6** (static output, content collections for articles, sitemap integration)
- **Cloudflare Workers + Static Assets** (hosting via Workers Builds, wired to this GitHub repo)
- **Beehiiv** (newsletter): native form POSTs to `/api/subscribe`, which proxies to Beehiiv's v2 Subscriptions API
- Custom CSS, no framework (dark/light theme with CSS variables)
- Custom rehype plugin for numbered inline citations with scroll-to-reference
- RSS feed at `/rss.xml` via `@astrojs/rss`

## Pages

| Route | File | Purpose |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | Hero, projects grid, newsletter form, socials |
| `/about` | `src/pages/about.astro` | Bio, credentials sidebar, portrait |
| `/work` | `src/pages/work.astro` | Experience timeline, skills |
| `/newsletter` | `src/pages/newsletter.astro` | Dedicated newsletter signup |
| `/notes` | `src/pages/notes/index.astro` | NYC Subway Birder column index (longform articles) |
| `/notes/:slug` | `src/pages/notes/[...slug].astro` | Individual article pages (Astro content collection) |
| `/notes/subway-birder` | `src/pages/notes/subway-birder.astro` | Column landing page / intro |
| `/subway-birder` | `src/pages/subway-birder.astro` | Standalone brand page for the column |
| `/tools` | `src/pages/tools/index.astro` | Showcase of all browser-based tools |
| `/library` | `src/pages/library.astro` | Public domain bird book index |
| `/library/birds-through-an-opera-glass` | `src/pages/library/birds-through-an-opera-glass.astro` | Illustrated gallery for Bailey's 1889 field guide |
| `/library/image-credits` | `src/pages/library/image-credits.astro` | Image credits for library assets |
| `/links` | `src/pages/links.astro` | Linktree-style link page (noindexed) |
| `/rss.xml` | `src/pages/rss.xml.ts` | RSS feed for /notes articles |

## Project structure

```
.
├── public/
│   ├── favicon.svg                (black bird emoji)
│   └── images/
│       ├── shelly.jpg             (360x640 portrait, used on /about)
│       ├── shelly-avatar.jpg      (360x360 face-centered crop, hero + OG)
│       ├── articles/              (inline images for /notes articles)
│       ├── library/               (book covers, author portraits)
│       ├── notes/                 (note card images)
│       ├── social/                (OG / social-share images)
│       ├── subway-birder/         (column brand assets)
│       └── tools/                 (tool card thumbnails)
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro       (HTML shell, nav, footer, JSON-LD, OG/Twitter meta, theme toggle)
│   ├── components/
│   │   ├── SubscribeForm.astro    (native Beehiiv signup form)
│   │   └── AuthorBio.astro        (reusable author bio block)
│   ├── content/
│   │   ├── notes/                 (longform articles as Markdown, Astro content collection)
│   │   └── intro/                 (standalone intro pages, e.g. subway-birder.md)
│   ├── content.config.ts          (collection schemas: notes + intro, with references, birdsMentioned, subwayRoutes)
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── work.astro
│   │   ├── newsletter.astro
│   │   ├── subway-birder.astro
│   │   ├── library.astro
│   │   ├── library/               (sub-pages: opera-glass gallery, image-credits)
│   │   ├── links.astro
│   │   ├── tools/index.astro
│   │   ├── notes/index.astro
│   │   ├── notes/[...slug].astro
│   │   ├── notes/subway-birder.astro
│   │   └── rss.xml.ts
│   ├── rehype-citations.mjs       (custom rehype plugin: numbered inline citations with scroll-to-reference)
│   └── styles/
│       └── global.css
├── worker.js                      (Cloudflare Worker entry: handles /api/subscribe, falls through to ASSETS)
├── wrangler.jsonc                 (Workers config: main + assets binding)
├── astro.config.mjs               (sitemap integration, rehype-citations plugin)
└── package.json
```

## Deploy

Cloudflare Workers Builds watches this repo's `main` branch. Every push triggers:

1. `npm run build` → static site output in `dist/`
2. Worker bundling from `worker.js`
3. Deploy to the `shellylynnx` Worker, serving `dist/` via the `ASSETS` binding

Usually live within ~60 seconds of a push.

### Required Cloudflare env vars

Set in the Cloudflare dashboard → Workers → `shellylynnx` → Settings → Environment variables (Production):

| Name | Type | Purpose |
| --- | --- | --- |
| `BEEHIIV_API_KEY` | Secret (encrypted) | Server-side Beehiiv API calls for `/api/subscribe` |

The Beehiiv publication ID is hardcoded in `worker.js` (it's a public identifier, safe to commit).

## Local development

```sh
npm install
npm run dev     # localhost:4321
```

Note: `/api/subscribe` does **not** work locally. Pages Functions and the Worker entry are only exercised when deployed to Cloudflare. The rest of the site renders normally in dev.

## Commands

| Command | Action |
| --- | --- |
| `npm install` | Install deps |
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run build` | Build to `./dist/` |
| `npm run preview` | Preview the production build locally |

## Design notes

- **Theme**: dark default (warm earth + gold/green accents), light mode toggle stored in `localStorage`
- **Typography**: Playfair Display (headings), Inter (body)
- **Color tokens** (see `src/styles/global.css` `:root`):
  - `--color-accent` `#345A40` (primary green)
  - `--color-secondary` `#C8A54E` (gold)
  - `--color-highlight` `#B5654A` (rust, used for error states and hover accents)
- **Section backgrounds** alternate via `.section:nth-child(even)` for subtle rhythm
- **Mobile nav**: logo hidden, theme toggle left, hamburger right, dropdown right-aligned; hero CTAs and subscribe form stack vertically

## Favicon

SVG with the 🐦‍⬛ Black Bird emoji. On older OSs that don't support the composite emoji (pre iOS 16.4 / macOS 13.3 / Android 13 / Windows 11 22H2), it falls back to 🐦 and ⬛ side-by-side.

## Contact

`subwaybirder@gmail.com`
