# Hostwright website

The static root site at `hostwright.dev` and documentation app at `docs.hostwright.dev` use Astro 7 and TypeScript. The root uses React for its interactive terminal scene; docs use Starlight and MDX. Both use local IBM Plex fonts.

## Local verification

Run each project's commands from its own directory. Lockfiles are separate.

```bash
npm ci
npm run check
npm run build
npm run check:links
npm audit --audit-level=high

cd docs
npm ci
npm run check
npm run build
npm run check:links
npm audit --audit-level=high
```

Root output is `dist/`; docs output is `docs/dist/`. `check:links` verifies generated local routes, assets, and HTML fragments. The docs build also runs Starlight's link validator. External URLs require separate verification.

Use `npm run dev` or `npm run preview` inside either project to serve it locally. Set a distinct port when serving both at once.

## Source layout

- `src/data/`: root copy, site links, roadmap, and release boundaries.
- `src/components/`, `src/pages/`, `src/styles/`: root UI.
- `docs/src/content/docs/`: documentation pages.
- `docs/src/styles/`, `docs/src/routeData.ts`: documentation theme and navigation.
- `scripts/`: social card generation and built-link checks.

## Hosting and CI

The root is hosted on GitHub Pages. `.github/workflows/deploy.yml` checks, builds, and publishes only the root `dist/` on authorized main-branch updates. `.github/workflows/check.yml` independently installs, typechecks, builds, checks links, and audits both projects on pull requests and main updates; it does not publish docs.

Docs use the existing Cloudflare Pages project. Account/project access is pending; dashboard access is signed out. Do not infer a configured deployment or migrate hosting. The docs project must use `docs` as its build root, `npm run build` as its build command, and `dist` as its output directory. Verify the existing project settings once access is available.

## Release truth

The core repository is preparing `0.0.2-rc.7`; no supported RC or GA channel has been published. The accepted scope is single-Mac CLI, local CPU/memory admission, narrow Compose import, and confirmed native desktop up/down/restart. Current interfaces are Manifest v3, Control API 2.2, Runtime Provider API v2, and SQLite schema v24.

| Installation path | What the site may claim |
| --- | --- |
| `brew install hostwright/tap/hostwright` | Installs signed dev.12, an unsupported qualification prerelease with older contracts. |
| Current source | Development builds; authenticated commands require a matching signed installation, identity bootstrap, and a running daemon. |
| `brew install hostwright` | Unavailable until official Homebrew cask acceptance. This is a required launch goal, not a completed installation path. |

Current-source and final-version release qualification remain pending. Do not call the CPU/memory quickstart tested before its real live transcript passes, or present deferred products as supported. Keep installation, compatibility, and roadmap copy aligned with the [GA readiness snapshot](https://github.com/hostwright/hostwright/blob/main/docs/release/ga-readiness-2026-10-08.md); the combined GA and official Homebrew launch date is unconfirmed.

Canonical scope: [ADR 0015](https://github.com/hostwright/hostwright/blob/main/docs/design/adr-0015-reduced-local-release.md). Installation and compatibility truth belong in the docs content and current core repository contracts.
