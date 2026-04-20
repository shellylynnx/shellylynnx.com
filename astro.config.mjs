// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { rehypeCitations } from "./src/rehype-citations.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://shellylynnx.com",
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/links"),
    }),
  ],
  markdown: {
    rehypePlugins: [rehypeCitations],
  },
});
