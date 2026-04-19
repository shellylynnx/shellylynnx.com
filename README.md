# shellylynnx.com

Personal site for Shelly Xiong — NYC birder, illustrator, and developer.

Live at [shellylynnx.com](https://shellylynnx.com).

## Stack

- **Astro 6** (static output)
- **Cloudflare Workers + Static Assets** (hosting via Workers Builds, wired to this GitHub repo)
- **Beehiiv** (newsletter) — native form POSTs to `/api/subscribe`, which proxies to Beehiiv's v2 Subscriptions API
- Custom CSS, no framework (dark/light theme with CSS variables)

## Pages

| Route | File |
| --- | --- |
| `/` | `src/pages/index.astro` — hero, projects grid, newsletter form, socials |
| `/about` | `src/pages/about.astro` — bio + credentials sidebar + portrait |
| `/work` | `src/pages/work.astro` — experience timeline + skills |
| `/newsletter` | `src/pages/newsletter.astro` — dedicated newsletter signup |

## Project structure

```
.
├── public/
│   ├── favicon.svg            (black bird emoji)
│   └── images/
│       ├── shelly.jpg         (360×640 portrait, used on /about)
│       └── shelly-avatar.jpg  (360×360 face-centered crop, hero + OG)
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro   (HTML shell, nav, footer, JSON-LD, OG/Twitter meta, theme toggle)
│   ├── components/
│   │   └── SubscribeForm.astro (native Beehiiv signup form)
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── work.astro
│   │   └── newsletter.astro
│   └── styles/
│       └── global.css
├── worker.js                  (Cloudflare Worker entry — handles /api/subscribe, falls through to ASSETS)
├── wrangler.jsonc             (Workers config: main + assets binding)
├── astro.config.mjs
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

`helloshellylynnx@gmail.com`
