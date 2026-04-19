#!/usr/bin/env node
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const NOTES_DIR = "src/content/notes";
const IS_CI = !!process.env.CI;
const SKIP_NETWORK = process.env.SKIP_NETWORK === "1" || (!IS_CI && !process.env.CHECK_NETWORK);

const SLOP_PHRASES = [
  "delve into",
  "navigate the landscape",
  "in today's world",
  "it is important to note",
  "moreover",
  "unveil",
  "rich tapestry",
  "pivotal moment",
  "at the end of the day",
];

const errors = [];
const warnings = [];

function fail(file, msg) {
  errors.push(`${file}: ${msg}`);
}

function warn(file, msg) {
  warnings.push(`${file}: ${msg}`);
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { fm: null, body: raw };
  const fmRaw = match[1];
  const body = match[2];
  const fm = {};
  let currentKey = null;
  let arrayTarget = null;
  for (const line of fmRaw.split("\n")) {
    const indent = line.match(/^(\s*)/)[1].length;
    const kv = line.match(/^\s*([a-zA-Z_]+):\s*(.*)$/);
    if (indent === 0 && kv) {
      const [, key, value] = kv;
      currentKey = key;
      arrayTarget = null;
      if (value === "" || value === null) {
        fm[key] = null;
      } else {
        fm[key] = value.replace(/^["']|["']$/g, "");
      }
    }
  }
  return { fm, body };
}

async function checkUrl(url) {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) return true;
    const get = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });
    return get.ok;
  } catch {
    return false;
  }
}

async function checkFile(file) {
  const raw = await readFile(file, "utf8");
  const { fm, body } = parseFrontmatter(raw);
  if (!fm) {
    fail(file, "missing frontmatter");
    return;
  }

  if (fm.title && fm.title.length > 70) {
    fail(file, `title is ${fm.title.length} chars (max 70)`);
  }
  if (fm.description) {
    const len = fm.description.length;
    if (len < 140 || len > 170) {
      fail(file, `description is ${len} chars (need 140–170)`);
    }
  }
  if (fm.author && fm.author !== "Shelly Xiong") {
    fail(file, `author is "${fm.author}" (must be "Shelly Xiong")`);
  }

  if (body.includes("—")) {
    const lines = body.split("\n");
    lines.forEach((line, i) => {
      if (line.includes("—")) {
        fail(file, `em dash on line ${i + 1}: ${line.trim().slice(0, 80)}`);
      }
    });
  }

  const bodyLower = body.toLowerCase();
  for (const phrase of SLOP_PHRASES) {
    if (bodyLower.includes(phrase)) {
      fail(file, `contains LLM-slop phrase: "${phrase}"`);
    }
  }

  if (!SKIP_NETWORK) {
    const urlRe = /\[[^\]]+\]\((https?:\/\/[^)]+)\)/g;
    const urls = new Set();
    let m;
    while ((m = urlRe.exec(body))) urls.add(m[1]);
    const checks = await Promise.all(
      [...urls].map(async (u) => ({ url: u, ok: await checkUrl(u) })),
    );
    for (const { url, ok } of checks) {
      if (!ok) warn(file, `link did not resolve: ${url}`);
    }

    const ebirdCodeRe = /ebird\.org\/species\/([a-z0-9]+)/gi;
    const codes = new Set();
    while ((m = ebirdCodeRe.exec(body))) codes.add(m[1]);
    const codeChecks = await Promise.all(
      [...codes].map(async (c) => ({
        code: c,
        ok: await checkUrl(`https://ebird.org/species/${c}`),
      })),
    );
    for (const { code, ok } of codeChecks) {
      if (!ok) warn(file, `ebird code did not resolve: ${code}`);
    }
  }
}

async function main() {
  let files = [];
  try {
    files = (await readdir(NOTES_DIR))
      .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
      .map((f) => join(NOTES_DIR, f));
  } catch {
    console.log(`(no ${NOTES_DIR} directory — nothing to check)`);
    return;
  }

  if (files.length === 0) {
    console.log("(no notes yet — nothing to check)");
    return;
  }

  for (const f of files) await checkFile(f);

  if (warnings.length) {
    console.log("\nWarnings:");
    for (const w of warnings) console.log(`  ⚠ ${w}`);
  }

  if (errors.length) {
    console.log("\nErrors:");
    for (const e of errors) console.log(`  ✗ ${e}`);
    console.log(
      `\nprepublish failed: ${errors.length} error(s), ${warnings.length} warning(s)`,
    );
    process.exit(1);
  }

  console.log(
    `\nprepublish ok: ${files.length} note(s) checked, ${warnings.length} warning(s)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
