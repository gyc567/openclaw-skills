import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SkillPackCard } from "./skill-pack-card";
import { BookOpen } from "lucide-react";

describe("SkillPackCard", () => {
  const mockProps = {
    name: "Test Pack",
    description: "A test skill pack",
    skillIds: ["github", "claude-team"],
    icon: BookOpen,
    color: "#10b981",
  };

  it("renders pack name correctly", () => {
    render(<SkillPackCard {...mockProps} />);
    expect(screen.getByText("Test Pack")).toBeInTheDocument();
  });

  it("renders description correctly", () => {
    render(<SkillPackCard {...mockProps} />);
    expect(screen.getByText("A test skill pack")).toBeInTheDocument();
  });

  it("renders skill count", () => {
    render(<SkillPackCard {...mockProps} />);
    expect(screen.getByText("2 skills")).toBeInTheDocument();
  });

  it("renders skill badges", () => {
    render(<SkillPackCard {...mockProps} />);
    expect(screen.getByText("github")).toBeInTheDocument();
    expect(screen.getByText("claude-team")).toBeInTheDocument();
  });
});
