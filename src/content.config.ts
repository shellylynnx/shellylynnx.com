import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const articleSchema = z.object({
  title: z.string().max(70),
  description: z.string().min(140).max(170),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  author: z.string().default("Shelly Xiong"),
  category: z.string(),
  tags: z.array(z.string()).default([]),
  canonicalURL: z.string().url().optional(),
  ogImage: z.string().optional(),
  ogImageAlt: z.string().optional(),
  draft: z.boolean().default(false),
  references: z
    .array(
      z.object({
        number: z.number().optional(),
        author: z.string().optional(),
        title: z.string(),
        publication: z.string().optional(),
        date: z.string().optional(),
        url: z.string().url().optional(),
        note: z.string().optional(),
      }),
    )
    .default([]),
  birdsMentioned: z
    .array(
      z.object({
        commonName: z.string(),
        ebirdCode: z.string(),
        note: z.string().optional(),
      }),
    )
    .default([]),
  subwayRoutes: z
    .array(
      z.object({
        hotspot: z.string(),
        lines: z.array(z.string()).default([]),
        buses: z.array(z.string()).optional(),
        lirr: z.string().optional(),
        directions: z.string(),
      }),
    )
    .default([]),
  photoCredits: z.string().optional(),
  topics: z.array(z.string()).optional(),
});

const notes = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/notes" }),
  schema: articleSchema,
});

const manifesto = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/manifesto" }),
  schema: articleSchema,
});

export const collections = { notes, manifesto };
