import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Docs live as MDX. Entry ids come from the path relative to base, without
// extension (e.g. "concepts/desired-state"), matching the slugs in data/nav.ts.
const docs = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/docs" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

export const collections = { docs };
