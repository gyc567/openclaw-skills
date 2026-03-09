import { describe, it, expect } from "vitest";
import { parseMdFile, isValidMdFile } from "./md-parser";

describe("md-parser", () => {
  describe("isValidMdFile", () => {
    it("should return true for .md files", () => {
      expect(isValidMdFile("test.md")).toBe(true);
      expect(isValidMdFile("README.MD")).toBe(true);
      expect(isValidMdFile("file.markdown")).toBe(true);
    });

    it("should return false for non-md files", () => {
      expect(isValidMdFile("test.txt")).toBe(false);
      expect(isValidMdFile("test.json")).toBe(false);
      expect(isValidMdFile("test")).toBe(false);
    });
  });

  describe("parseMdFile", () => {
    it("should parse frontmatter correctly", () => {
      const content = `---
name: Test Skill
description: A test skill description
category: finance
tags:
  - trading
  - ai
priceUsd: 9.99
version: 1.0.0
packageUrl: https://github.com/test
---

# Additional content`;

      const result = parseMdFile(content);

      expect(result.name).toBe("Test Skill");
      expect(result.description).toBe("A test skill description");
      expect(result.category).toBe("finance");
      expect(result.tags).toEqual(["trading", "ai"]);
      expect(result.priceUsd).toBe(9.99);
      expect(result.version).toBe("1.0.0");
      expect(result.packageUrl).toBe("https://github.com/test");
    });

    it("should handle missing frontmatter", () => {
      const content = `# Hello World

This is a description without frontmatter.`;

      const result = parseMdFile(content);

      expect(result.name).toBeUndefined();
      expect(result.description).toBe("Hello World\n\nThis is a description without frontmatter.");
    });

    it("should handle empty frontmatter", () => {
      const content = `---
---

Content after empty frontmatter.`;

      const result = parseMdFile(content);

      expect(result.description).toBe("Content after empty frontmatter.");
    });

    it("should handle quoted values", () => {
      const content = `---
name: "My Skill"
category: 'finance'
---

Description here.`;

      const result = parseMdFile(content);

      expect(result.name).toBe("My Skill");
      expect(result.category).toBe("finance");
    });

    it("should handle alternative keys", () => {
      const content = `---
package_url: https://example.com
url: https://alt.com
price: 5.50
---

Description.`;

      const result = parseMdFile(content);

      expect(result.packageUrl).toBe("https://example.com");
      expect(result.priceUsd).toBe(5.50);
    });

    it("should use body as description when no frontmatter description", () => {
      const content = `---
name: Test Skill
---

This is the body content that should become description.`;

      const result = parseMdFile(content);

      expect(result.name).toBe("Test Skill");
      expect(result.description).toBe("This is the body content that should become description.");
    });

    it("should handle invalid frontmatter gracefully", () => {
      const content = `---
invalid yaml here:
  - broken
---
Fallback description.`;

      const result = parseMdFile(content);

      // Should still return description from body
      expect(result.description).toBeDefined();
    });
  });
});
