# Brand notes

## The idea

Hostwright reconciles **declared state** with **actual host runtime state**. The
identity encodes exactly that.

- **The H mark** is two host *pillars* joined by a control *bridge*. The pillars
  are the two states Hostwright holds in mind; the bridge is reconciliation.
- **One motif only:** host pillars · control bridge · reconciliation line. It
  appears in the mark and, quietly, as the thin rule between sections. No
  gradients, particles, glassmorphism, or 3D.

## Assets

### Production assets (in this site)

These are the project's **own logo artwork**, processed to true transparency:

- [`public/hostwright-mark.png`](../public/hostwright-mark.png) — the H mark
  (512×512, transparent). Favicon and social card.
- [`public/hostwright-wordmark.png`](../public/hostwright-wordmark.png) — the
  "Hostwright" wordmark (transparent). Header and footer, via `HostwrightLogo.astro`.
- [`public/apple-touch-icon.png`](../public/apple-touch-icon.png) — the mark on an
  off-white tile (180×180) so it stays visible on iOS.
- `public/og.png` — the social card, composited from the mark + wordmark by
  `scripts/render-og.mjs`.

### Source material (preserved, not modified)

The original artwork lives at the **repository root**, one level up from this site,
and is left untouched:

- `cc7fa227-…png` — H mark on a baked checkerboard (RGB, **no real alpha**).
- `ChatGPT…11_37_17.png` — H mark on white **(source for the mark)**.
- `ChatGPT…11_22_44.png` — "Hostwright" wordmark on white **(source for the wordmark)**.
- `ChatGPT…11_35_08.png` — wordmark on a baked checkerboard.

The two "on white" files are the cleanest. They were converted to transparency by
keying luminance to alpha (white → transparent) and unifying the ink to the brand
charcoal, which removes the white box and avoids edge halos on the warm off-white
background. Re-run via `scripts/` if the source art changes.

## Palette

Defined in [`src/styles/tokens.css`](../src/styles/tokens.css).

| Token | Value | Use |
| --- | --- | --- |
| `--color-bg` | `#faf9f6` | Warm off-white background |
| `--color-surface` | `#f3f1ec` | Stone cards / code chrome |
| `--color-text` | `#202327` | Deep charcoal ink (matches the mark) |
| `--color-accent` | `#1f3a5f` | Restrained deep navy (links, CTAs) |
| `--color-border` | `#e4e1da` | Hairline borders |

## Type

- **IBM Plex Sans** for UI and headings — a serious, technical, non-default sans.
- **IBM Plex Mono** for the CLI, code, and small labels only.

Both are self-hosted via `@fontsource`, so there is no runtime font request.
