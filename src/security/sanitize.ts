<<<<<<< Updated upstream
// src/security/sanitize.ts — Hardened HTML sanitization
//
// Self-contained, dependency-free sanitizer designed to resist the nested /
// malformed-tag bypasses flagged by CodeQL (#174-#178). The core idea is to
// process the input *iteratively until it stabilizes*, so that payloads which
// re-form a dangerous token after a single pass (e.g. `<scr<script>ipt>`) are
// neutralized rather than partially rewritten into a live tag.

// Elements whose entire subtree (tag + inner content) must be discarded.
=======
>>>>>>> Stashed changes
const DANGEROUS_BLOCK_TAGS = [
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "form",
  "svg",
  "math",
  "template",
  "noscript",
  "link",
  "meta",
  "base",
  "title",
] as const;

<<<<<<< Updated upstream
// Tags allowed to survive in rich-text output.
=======
>>>>>>> Stashed changes
const ALLOWED_TAGS = new Set<string>([
  "b",
  "i",
  "em",
  "strong",
  "a",
  "p",
  "br",
  "ul",
  "ol",
  "li",
  "blockquote",
  "code",
]);

<<<<<<< Updated upstream
// Per-tag attribute allowlist. Anything not listed is dropped.
=======
>>>>>>> Stashed changes
const ALLOWED_ATTR: Record<string, Set<string>> = {
  a: new Set(["href", "title", "rel", "target"]),
};

<<<<<<< Updated upstream
// URL schemes that must never appear in an href.
const DANGEROUS_URL_SCHEMES = ["javascript:", "data:", "vbscript:", "file:"];

/**
 * Iteratively removes dangerous elements together with their inner content.
 * Runs until the output stops changing so nested/re-forming payloads are fully
 * collapsed.
 */
=======
const DANGEROUS_URL_SCHEMES = ["javascript:", "data:", "vbscript:", "file:"];

>>>>>>> Stashed changes
function stripDangerousBlocks(input: string): string {
  let s = input;
  let previous: string;
  do {
    previous = s;
    for (const tag of DANGEROUS_BLOCK_TAGS) {
<<<<<<< Updated upstream
      // Remove a complete `<tag ...> ... </tag>` block including its content.
      s = s.replace(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}\\s*>`, "gi"), "");
      // Remove any dangling opening/closing tag of the same element.
=======
      s = s.replace(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}\\s*>`, "gi"), "");
>>>>>>> Stashed changes
      s = s.replace(new RegExp(`<\\/?${tag}\\b[^>]*>`, "gi"), "");
    }
  } while (s !== previous);
  return s;
}

<<<<<<< Updated upstream
/**
 * Sanitizes the attribute string of an allowed tag against the per-tag
 * allowlist, stripping event handlers and dangerous URL schemes.
 */
=======
>>>>>>> Stashed changes
function sanitizeAttributes(tag: string, rawAttrs: string): string {
  const allowed = ALLOWED_ATTR[tag];
  if (!allowed) return "";

  let out = "";
  const attrRegex = /([a-zA-Z_:][a-zA-Z0-9_:.-]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  let match: RegExpExecArray | null;
  while ((match = attrRegex.exec(rawAttrs)) !== null) {
    const name = match[1].toLowerCase();
    const value = match[3] ?? match[4] ?? match[5] ?? "";

<<<<<<< Updated upstream
    // Never allow inline event handlers.
=======
>>>>>>> Stashed changes
    if (name.startsWith("on")) continue;
    if (!allowed.has(name)) continue;

    if (name === "href") {
      const normalized = value
        .trim()
        .toLowerCase()
<<<<<<< Updated upstream
        // eslint-disable-next-line no-control-regex -- intentional: strip control chars to prevent URL bypass
=======
>>>>>>> Stashed changes
        .replace(/[\u0000-\u0020]+/g, "");
      if (DANGEROUS_URL_SCHEMES.some((scheme) => normalized.startsWith(scheme))) continue;
    }

    const safeValue = value.replace(/"/g, "&quot;");
    out += ` ${name}="${safeValue}"`;
  }
  return out;
}

<<<<<<< Updated upstream
/**
 * Removes every tag not on the allowlist and normalizes the survivors.
 * Iterates until stable to defeat tokens that re-form after a pass.
 */
=======
>>>>>>> Stashed changes
function sanitizeTags(input: string): string {
  let s = input;
  let previous: string;
  do {
    previous = s;
    s = s.replace(/<[^>]*>/g, (tagStr) => {
      const parsed = tagStr.match(/^<\s*(\/?)\s*([a-zA-Z][a-zA-Z0-9]*)([\s\S]*?)\/?\s*>$/);
      if (!parsed) return "";
      const isClosing = parsed[1] === "/";
      const name = parsed[2].toLowerCase();
      if (!ALLOWED_TAGS.has(name)) return "";
      if (isClosing) return `</${name}>`;
      const attrs = sanitizeAttributes(name, parsed[3] ?? "");
      return `<${name}${attrs}>`;
    });
  } while (s !== previous);
  return s;
}

<<<<<<< Updated upstream
/**
 * Sanitizes untrusted HTML down to a small allowlist of formatting tags.
 * Dangerous elements and their content, event handlers and unsafe URL schemes
 * are removed.
 */
=======
>>>>>>> Stashed changes
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return "";
  return sanitizeTags(stripDangerousBlocks(dirty));
}

<<<<<<< Updated upstream
/**
 * Strips all HTML tags and returns plain text. Dangerous elements have their
 * content removed first; remaining tags are stripped while preserving inner
 * text.
 */
=======
>>>>>>> Stashed changes
export function stripHtml(dirty: string): string {
  if (!dirty) return "";
  let s = stripDangerousBlocks(dirty);
  let previous: string;
  do {
    previous = s;
    s = s.replace(/<[^>]*>/g, "");
  } while (s !== previous);
  return s;
}

<<<<<<< Updated upstream
/**
 * Escapes characters that are dangerous in an HTML context. Idempotent-safe for
 * plain text (does not touch already-safe characters).
 */
=======
>>>>>>> Stashed changes
export function escapeHtml(str: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
    "`": "&#x60;",
    "=": "&#x3D;",
  };
  let out = "";
  for (const ch of str) out += map[ch] ?? ch;
  return out;
}

<<<<<<< Updated upstream
/** Encodes a string for safe use inside a URL component. */
=======
>>>>>>> Stashed changes
export function escapeUrl(str: string): string {
  return encodeURIComponent(str);
}
