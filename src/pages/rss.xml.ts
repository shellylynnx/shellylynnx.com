import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const notes = await getCollection("notes", ({ data }) => !data.draft);
  const sorted = notes.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );

  return rss({
    title: "NYC Subway Birder",
    description:
      "Longform NYC birding writing by Shelly Lynn Xiong. Spring migration, urban conservation, birding ethics, and the infrastructure of paying attention in New York City.",
    site: context.site!,
    items: sorted.map((note) => ({
      title: note.data.title,
      pubDate: note.data.pubDate,
      description: note.data.description,
      link: `/notes/${note.id}/`,
      author: note.data.author,
      categories: note.data.tags,
    })),
    customData: `<language>en-us</language>`,
  });
}
