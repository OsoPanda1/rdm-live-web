import { describe, it, expect } from "vitest";
import { sanitizeHtml, stripHtml, escapeHtml } from "../sanitize";

describe("sanitizeHtml — CodeQL #174-#178 regression", () => {
  it("removes script tags", () => {
    expect(sanitizeHtml('<p>ok</p><script>alert(1)</script>')).toBe("<p>ok</p>");
  });

  it("blocks nested bypass that defeated regex sanitizers", () => {
    expect(sanitizeHtml('<scr<script>ipt>alert(1)</scr</script>ipt>')).not.toContain("alert");
  });

  it("strips event handlers", () => {
    expect(sanitizeHtml('<a href="x" onclick="alert(1)">x</a>')).not.toContain("onclick");
  });

  it("blocks javascript: URLs", () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">x</a>')).not.toContain("javascript:");
  });

  it("blocks data: URLs in href", () => {
    const out = sanitizeHtml('<a href="data:text/html,<script>alert(1)</script>">x</a>');
    expect(out).not.toContain("script");
  });

  it("preserves allowed inline formatting", () => {
    expect(sanitizeHtml("<p><strong>hi</strong></p>")).toContain("<strong>");
  });
});

describe("stripHtml", () => {
  it("removes all tags including malformed", () => {
    expect(stripHtml("<p>a<script>b</p>")).toBe("ab");
  });
});

describe("escapeHtml — CodeQL #1, #6 regression", () => {
  it("escapes all dangerous chars completely", () => {
    expect(escapeHtml(`<>&"'/\``)).toBe("&lt;&gt;&amp;&quot;&#39;&#x2F;&#x60;");
  });
  it("is idempotent on safe input", () => {
    expect(escapeHtml("hello world")).toBe("hello world");
  });
});
