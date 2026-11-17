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

The production root site uses the existing Cloudflare Worker `hostwrightdev`, with custom domains `hostwright.dev` and `www.hostwright.dev`. Workers Builds runs `npm run build` from the repository root, then `npx wrangler deploy` for `main` or `npx wrangler versions upload` for other branches. `wrangler.jsonc` points to the generated `dist/` assets and records the existing domains, compatibility settings and preview URLs. `_headers` and `_redirects` apply to those static assets. A successful version upload creates a preview; it does not publish the branch to production.

The existing GitHub Pages workflow also checks, builds and publishes root `dist/` on authorized main-branch updates. `.github/workflows/check.yml` independently installs, typechecks, builds, checks links, and audits both projects on pull requests and main updates; it does not publish docs.

Docs use the existing Cloudflare Pages project `hostwright-docs`, configured with `docs` as the build root, `npm run build` as the build command, and `dist` as the output directory. Root Workers configuration does not deploy the docs project.

## Release truth

Hostwright v0.0.2 is the single-Mac release for Apple silicon on macOS 26 or later. Install the signed archive or package from the [immutable release](https://github.com/hostwright/hostwright/releases/tag/v0.0.2), or use `brew install hostwright/tap/hostwright`. Official Homebrew inclusion is deferred.

The release covers local CLI workflows, CPU/memory admission, narrow Compose import, and confirmed desktop up/down/restart. Interfaces are Manifest v3, Control API 2.2, Runtime Provider API v2, and SQLite schema v24. The [compatibility matrix](https://docs.hostwright.dev/reference/compatibility/) records the provider boundary. One physical host and a macOS VM establish no independent-hardware or high-availability claim.

The [release process](https://github.com/hostwright/hostwright/blob/main/docs/release/RELEASE_PROCESS.md) uses five focused groups: source, artifact integrity, installation, working product and documentation. Historical development evidence remains bound to its original source and artifacts.

The immutable dev.11/dev.12 builds remain historical qualification prereleases. Multi-Mac, Kubernetes, Docker-client compatibility, accelerators, cloud/team features and automatic updates are outside v0.0.2. See [ADR 0015](https://github.com/hostwright/hostwright/blob/main/docs/design/adr-0015-reduced-local-release.md).
