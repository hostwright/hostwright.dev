// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import react from "@astrojs/react";

import cloudflare from "@astrojs/cloudflare";

// Canonical production URL. Pre-screened, not yet reserved — see site/README.md.
export default defineConfig({
  site: "https://hostwright.dev",
  integrations: [mdx(), sitemap(), react()],

  markdown: {
    // Build-time syntax highlighting. No client JS shipped for code blocks.
    shikiConfig: {
      theme: "github-light",
      wrap: false,
    },
  },

  vite: {
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: "three-ecosystem",
                test: /node_modules[\\/](?:three|@react-three|postprocessing)[\\/]/,
                minSize: 20 * 1024,
                maxSize: 400 * 1024,
              },
            ],
          },
        },
      },
    },
  },

  adapter: cloudflare(),
});