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
      serialize(item) {
        if (
          item.url === "https://shellylynnx.com/notes/subway-birder/" ||
          item.url === "https://shellylynnx.com/notes/subway-birder"
        ) {
          item.priority = 0.9;
        }
        return item;
      },
    }),
  ],
  markdown: {
    rehypePlugins: [rehypeCitations],
  },
});
