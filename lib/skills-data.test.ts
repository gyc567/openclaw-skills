import { describe, it, expect } from "vitest";
import {
  skills,
  categories,
  searchSkills,
  getSkillsByCategory,
  getSkillById,
  totalSkills,
  totalCategories,
} from "./skills-data";

describe("skills-data", () => {
  describe("categories", () => {
    it("should have valid category structure", () => {
      expect(categories.length).toBeGreaterThan(0);
      categories.forEach((category) => {
        expect(category).toHaveProperty("id");
        expect(category).toHaveProperty("name");
        expect(category).toHaveProperty("count");
        expect(category).toHaveProperty("color");
        expect(typeof category.id).toBe("string");
        expect(typeof category.name).toBe("string");
        expect(typeof category.count).toBe("number");
        expect(typeof category.color).toBe("string");
        expect(category.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });

    it("should have unique category IDs", () => {
      const ids = categories.map((c) => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe("skills", () => {
    it("should have valid skill structure", () => {
      expect(skills.length).toBeGreaterThan(0);
      skills.forEach((skill) => {
        expect(skill).toHaveProperty("id");
        expect(skill).toHaveProperty("name");
        expect(skill).toHaveProperty("description");
        expect(skill).toHaveProperty("author");
        expect(skill).toHaveProperty("category");
        expect(skill).toHaveProperty("tags");
        expect(typeof skill.id).toBe("string");
        expect(typeof skill.name).toBe("string");
        expect(typeof skill.description).toBe("string");
        expect(typeof skill.author).toBe("string");
        expect(typeof skill.category).toBe("string");
        expect(Array.isArray(skill.tags)).toBe(true);
      });
    });

    it("should have unique skill IDs", () => {
      const ids = skills.map((s) => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid category references", () => {
      const categoryIds = new Set(categories.map((c) => c.id));
      skills.forEach((skill) => {
        expect(categoryIds.has(skill.category)).toBe(true);
      });
    });

    it("should have non-empty tags", () => {
      skills.forEach((skill) => {
        expect(skill.tags.length).toBeGreaterThan(0);
      });
    });
  });

  describe("searchSkills", () => {
    it("should return all skills when query is empty", () => {
      const result = searchSkills("");
      expect(result.length).toBe(skills.length);
    });

    it("should find skills by name", () => {
      const result = searchSkills("github");
      expect(result.length).toBeGreaterThan(0);
      result.forEach((skill) => {
        const matchesName = skill.name.toLowerCase().includes("github");
        const matchesDesc = skill.description.toLowerCase().includes("github");
        const matchesTags = skill.tags.some((tag) =>
          tag.toLowerCase().includes("github")
        );
        expect(matchesName || matchesDesc || matchesTags).toBe(true);
      });
    });

    it("should find skills by description", () => {
      const result = searchSkills("automation");
      expect(result.length).toBeGreaterThan(0);
      result.forEach((skill) => {
        const matchesName = skill.name.toLowerCase().includes("automation");
        const matchesDesc = skill.description.toLowerCase().includes("automation");
        const matchesTags = skill.tags.some((tag) =>
          tag.toLowerCase().includes("automation")
        );
        expect(matchesName || matchesDesc || matchesTags).toBe(true);
      });
    });

    it("should find skills by tag", () => {
      const result = searchSkills("cli");
      expect(result.length).toBeGreaterThan(0);
      result.forEach((skill) => {
        const matchesName = skill.name.toLowerCase().includes("cli");
        const matchesDesc = skill.description.toLowerCase().includes("cli");
        const matchesTags = skill.tags.some((tag) =>
          tag.toLowerCase().includes("cli")
        );
        expect(matchesName || matchesDesc || matchesTags).toBe(true);
      });
    });

    it("should be case insensitive", () => {
      const lowerResult = searchSkills("github");
      const upperResult = searchSkills("GITHUB");
      const mixedResult = searchSkills("GitHub");
      expect(lowerResult.length).toBe(upperResult.length);
      expect(lowerResult.length).toBe(mixedResult.length);
    });

    it("should return empty array for non-matching query", () => {
      const result = searchSkills("xyznonexistent123");
      expect(result).toEqual([]);
    });

    it("should handle partial matches", () => {
      const result = searchSkills("git");
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("getSkillsByCategory", () => {
    it("should return skills for valid category", () => {
      const result = getSkillsByCategory("git-github");
      expect(result.length).toBeGreaterThan(0);
      result.forEach((skill) => {
        expect(skill.category).toBe("git-github");
      });
    });

    it("should return empty array for invalid category", () => {
      const result = getSkillsByCategory("non-existent-category");
      expect(result).toEqual([]);
    });

    it("should return correct skills for each category", () => {
      categories.forEach((category) => {
        const result = getSkillsByCategory(category.id);
        const expectedSkills = skills.filter((s) => s.category === category.id);
        expect(result.length).toBe(expectedSkills.length);
      });
    });
  });

  describe("getSkillById", () => {
    it("should return skill for valid ID", () => {
      const result = getSkillById("github");
      expect(result).toBeDefined();
      expect(result?.id).toBe("github");
      expect(result?.name).toBe("github");
    });

    it("should return undefined for invalid ID", () => {
      const result = getSkillById("non-existent-skill");
      expect(result).toBeUndefined();
    });

    it("should return exact match only", () => {
      const result = getSkillById("github-pr");
      expect(result?.id).toBe("github-pr");
      expect(result?.id).not.toBe("github");
    });
  });

  
  describe("assist_agent_repair skill", () => {
    it("should find assist_agent_repair by name", () => {
      const result = searchSkills("assist_agent_repair");
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((s) => s.id === "assist_agent_repair")).toBe(true);
    });

    it("should find assist_agent_repair by description", () => {
      const result = searchSkills("A2A protocol");
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((s) => s.id === "assist_agent_repair")).toBe(true);
    });

    it("should find assist_agent_repair by tag", () => {
      const result = searchSkills("agent");
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((s) => s.id === "assist_agent_repair")).toBe(true);
    });

    it("should return skill by ID", () => {
      const result = getSkillById("assist_agent_repair");
      expect(result).toBeDefined();
      expect(result?.id).toBe("assist_agent_repair");
      expect(result?.name).toBe("assist_agent_repair");
      expect(result?.author).toBe("Grok Assistant");
    });

    it("should be in clawskillstore-tools category", () => {
      const result = getSkillById("assist_agent_repair");
      expect(result?.category).toBe("clawskillstore-tools");
    });

    it("should have valid API commands", () => {
      const result = getSkillById("assist_agent_repair");
      expect(result?.api).toBeDefined();
      expect(result?.api?.commands).toBeDefined();
      expect(result?.api?.commands.length).toBe(4);
      expect(result?.api?.commands[0]?.name).toBe("discover_sessions");
    });
  });

describe("constants", () => {
    it("totalSkills should be 701", () => {
      expect(totalSkills).toBe(701);
    });

    it("totalCategories should match categories length", () => {
      expect(totalCategories).toBe(categories.length);
    });
  });
});
