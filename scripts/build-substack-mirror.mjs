#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const slug = process.argv[2];
if (!slug) {
  console.error("usage: npm run substack:mirror <slug>");
  console.error(
    "  example: npm run substack:mirror spring-migration-2026-warbler-fallouts",
  );
  process.exit(1);
}

const SITE = "https://shellylynnx.com";
const sourcePath = join("src/content/notes", `${slug}.md`);
const outDir = "substack-mirrors";
const outPath = join(outDir, `${slug}.md`);

const raw = await readFile(sourcePath, "utf8");
const fmMatch = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
if (!fmMatch) {
  console.error("no frontmatter in source");
  process.exit(1);
}

const [, fmRaw, body] = fmMatch;

const titleMatch = fmRaw.match(/^title:\s*["']?([^"'\n]+)["']?/m);
const title = titleMatch ? titleMatch[1].trim() : slug;

const canonical = `${SITE}/notes/${slug}`;
const topBanner = `> This piece was first published on [shellylynnx.com](${canonical}). Subscribe there for the full References section.`;
const footer = `\n\n---\n\nOriginally published at [${canonical}](${canonical}).`;

await mkdir(outDir, { recursive: true });

const mirror = `# ${title}\n\n${topBanner}\n\n${body.trim()}${footer}\n`;
await writeFile(outPath, mirror, "utf8");

console.log(`wrote ${outPath}`);
console.log(`canonical URL: ${canonical}`);
