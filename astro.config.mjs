// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import react from "@astrojs/react";

// Canonical production URL. Pre-screened, not yet reserved — see site/README.md.
export default defineConfig({
  site: "https://hostwright.dev",
  integrations: [mdx(), sitemap(), react()],
  // Docs moved to docs.hostwright.dev. GitHub Pages has no server-side
  // redirects, so Astro emits static meta-refresh pages for the old routes.
  redirects: {
    "/docs": "https://docs.hostwright.dev/",
    "/docs/getting-started": "https://docs.hostwright.dev/getting-started/quick-start/",
    "/docs/concepts/desired-state": "https://docs.hostwright.dev/concepts/desired-state/",
    "/docs/concepts/runtime-adapter": "https://docs.hostwright.dev/concepts/runtime-adapter/",
    "/docs/concepts/apple-container-boundary": "https://docs.hostwright.dev/concepts/apple-container-boundary/",
    "/docs/concepts/reconciliation": "https://docs.hostwright.dev/concepts/reconciliation/",
    "/docs/concepts/safety-model": "https://docs.hostwright.dev/concepts/safety-model/",
    "/docs/reference/cli": "https://docs.hostwright.dev/reference/cli/",
    "/docs/reference/hostwright-yaml": "https://docs.hostwright.dev/reference/manifest/",
    "/docs/reference/ai-agents": "https://docs.hostwright.dev/reference/ai-agents/",
    "/docs/reference/limitations": "https://docs.hostwright.dev/reference/limitations/",
    "/docs/reference/compatibility": "https://docs.hostwright.dev/reference/compatibility/",
    "/docs/design/why-hostwright": "https://docs.hostwright.dev/overview/why-hostwright/",
    "/docs/design/non-goals": "https://docs.hostwright.dev/overview/non-goals/",
    "/docs/design/name-and-identity": "/",
  },
  markdown: {
    // Build-time syntax highlighting. No client JS shipped for code blocks.
    shikiConfig: {
      theme: "github-light",
      wrap: false,
    },
  },
});