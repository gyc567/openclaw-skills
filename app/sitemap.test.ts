import { describe, it, expect } from "vitest";
import sitemap from "./sitemap";

describe("sitemap.ts", () => {
  it("exports sitemap with all public pages", () => {
    const entries = sitemap();
    expect(entries.length).toBe(9);

    const urls = entries.map((e) => e.url);
    expect(urls).toContain("https://opencreditai.com");
    expect(urls).toContain("https://opencreditai.com/blog");
    expect(urls).toContain("https://opencreditai.com/blog/claude-code-unpacked-for-ai-skill-marketplaces");
    expect(urls).toContain("https://opencreditai.com/blog/create-first-skill-listing");
    expect(urls).toContain("https://opencreditai.com/dojo");
    expect(urls).toContain("https://opencreditai.com/agent-guide");
    expect(urls).toContain("https://opencreditai.com/seller/register");
    expect(urls).toContain("https://opencreditai.com/audit");
    expect(urls).toContain("https://opencreditai.com/skills/create");
  });

  it("sets homepage as highest priority", () => {
    const entries = sitemap();
    const homepage = entries.find((e) => e.url === "https://opencreditai.com");
    expect(homepage?.priority).toBe(1);
  });

  it("does not include private pages", () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).not.toContain("https://opencreditai.com/dashboard");
    expect(urls).not.toContain("https://opencreditai.com/api");
    expect(urls).not.toContain("https://opencreditai.com/claim");
    expect(urls).not.toContain("https://opencreditai.com/seller/dashboard");
  });

  it("all entries have lastModified date", () => {
    const entries = sitemap();
    entries.forEach((entry) => {
      expect(entry.lastModified).toBeInstanceOf(Date);
    });
  });
});
