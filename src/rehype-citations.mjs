import { visit } from "unist-util-visit";

/**
 * Turns inline citation markers like "(1)", "(1, 2)", "(1, 2, 3)" found in
 * body text into Wikipedia-style superscript links that point to #ref-N in the
 * References accordion rendered by the Notes article template.
 *
 * - Runs on rehype AST (after Markdown -> HTML conversion).
 * - Skips text inside <sup>, <a>, <code>, <pre>, and headings so existing
 *   links and anchors aren't touched.
 * - Citation numbers are capped at 3 digits to avoid false-positive matches
 *   on 4-digit years like "(1896)" or "(2026)" that show up in body prose
 *   (publication dates, history references, etc.). Articles with 1000+ refs
 *   would need this raised, but that's not a real constraint right now.
 */
const CITATION_RE = /\((\d{1,3}(?:\s*,\s*\d{1,3})*)\)/g;
const SKIP_TAGS = new Set(["sup", "a", "code", "pre", "h1", "h2", "h3", "h4", "h5", "h6"]);

export function rehypeCitations() {
  return (tree) => {
    visit(tree, "text", (node, index, parent) => {
      if (!parent || typeof index !== "number") return;
      if (parent.type === "element" && SKIP_TAGS.has(parent.tagName)) return;

      const value = node.value;
      if (!value.includes("(")) return;

      CITATION_RE.lastIndex = 0;
      const pieces = [];
      let last = 0;
      let match;

      while ((match = CITATION_RE.exec(value)) !== null) {
        if (match.index > last) {
          pieces.push({ type: "text", value: value.slice(last, match.index) });
        }

        const nums = match[1].split(/\s*,\s*/);
        const inner = [];
        nums.forEach((n, i) => {
          if (i > 0) inner.push({ type: "text", value: ", " });
          inner.push({
            type: "element",
            tagName: "a",
            properties: {
              href: `#ref-${n}`,
              className: ["note-cite-link"],
            },
            children: [{ type: "text", value: n }],
          });
        });

        pieces.push({
          type: "element",
          tagName: "sup",
          properties: { className: ["note-cite"] },
          children: [
            { type: "text", value: "[" },
            ...inner,
            { type: "text", value: "]" },
          ],
        });

        last = match.index + match[0].length;
      }

      if (last === 0) return;
      if (last < value.length) {
        pieces.push({ type: "text", value: value.slice(last) });
      }

      parent.children.splice(index, 1, ...pieces);
      return index + pieces.length;
    });
  };
}
