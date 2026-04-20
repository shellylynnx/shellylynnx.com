import { visit } from "unist-util-visit";

/**
 * Turns inline citation markers like "(1)", "(1, 2)", "(1, 2, 3)" found in
 * body text into Wikipedia-style superscript links that point to #ref-N in the
 * References accordion rendered by the Notes article template.
 *
 * - Runs on rehype AST (after Markdown -> HTML conversion).
 * - Skips text inside <sup>, <a>, <code>, <pre>, and headings so existing
 *   links and anchors aren't touched.
 */
const CITATION_RE = /\((\d+(?:\s*,\s*\d+)*)\)/g;
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
