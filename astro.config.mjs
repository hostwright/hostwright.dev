// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

// Canonical production URL. Pre-screened, not yet reserved — see site/README.md.
export default defineConfig({
  site: "https://hostwright.dev",
  integrations: [mdx()],
  markdown: {
    // Build-time syntax highlighting. No client JS shipped for code blocks.
    shikiConfig: {
      theme: "github-light",
      wrap: false,
    },
  },
});
