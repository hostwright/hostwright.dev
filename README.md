# Hostwright website

The marketing and documentation site for **Hostwright** — a Mac-native
desired-state control plane for Apple container workloads.

## Stack

- [Astro](https://astro.build) (static output) + TypeScript
- MDX for documentation content
- Self-hosted IBM Plex Sans / IBM Plex Mono (via `@fontsource`)
- Build-time syntax highlighting (Shiki) — no client JavaScript shipped for code
- Hand-written CSS with design tokens (no UI framework)

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies. |
| `npm run dev` | Start the dev server at `localhost:4321`. |
| `npm run build` | Generate the social card, then build static output to `dist/`. |
| `npm run preview` | Serve the built `dist/` locally. |
| `npm run check` | Type-check the project (`astro check`). |
| `npm run og` | Regenerate `public/og.png` from `assets/og-card.svg`. |

## Structure

```
src/
  data/        Typed content: site config, nav, roadmap, non-goals, homepage copy
  content/docs/  Documentation pages (MDX)
  components/   Small, single-purpose UI components
  layouts/     BaseLayout (chrome + meta) and DocsLayout (sidebar + TOC)
  pages/       index.astro, docs/[...slug].astro, 404.astro
  styles/      tokens.css (design tokens) + base.css
assets/        og-card.svg (source for the social image)
public/        hostwright-mark.svg (favicon + logo), generated og.png
scripts/       render-og.mjs (SVG → PNG social card)
brand/         Brand notes; see brand/README.md
```

Editing copy rarely means touching components: most text lives in `src/data/*.ts`
and `src/content/docs/**`.

## Deploying

This is a static site. Build it and serve the `dist/` directory from any static
host (Cloudflare Pages, Netlify, Vercel, GitHub Pages, S3, etc.):

```bash
npm install
npm run build
# deploy ./dist
```

The production URL is set in `astro.config.mjs` (`site: "https://hostwright.dev"`)
and is used for canonical links and the social card URL. Update it if the domain
changes.

## Before publishing

The project name is selected but its public namespaces are **not yet reserved**.
Confirm and update these placeholders in `src/data/site.ts` first:

- `links.github` — the real GitHub repository URL.
- `links.x`, `links.reddit` — real social handles (or remove them).
- The `hostwright.dev` domain.
