import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InstallCommand } from "./install-command";

const mockClipboard = {
  writeText: vi.fn(),
  readText: vi.fn(),
};

Object.defineProperty(global, "navigator", {
  value: {
    ...global.navigator,
    clipboard: mockClipboard,
  },
  writable: true,
});

describe("InstallCommand", () => {
  const mockProps = {
    packName: "Test Pack",
    skillIds: ["github", "claude-team"],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders pack name correctly", () => {
    render(<InstallCommand {...mockProps} />);
    expect(screen.getByText("Test Pack")).toBeInTheDocument();
  });

  it("renders skill count", () => {
    render(<InstallCommand {...mockProps} />);
    expect(screen.getByText("2 skills")).toBeInTheDocument();
  });

  it("renders correct install command", () => {
    render(<InstallCommand {...mockProps} />);
    expect(
      screen.getByText("npx clawdhub@latest install github claude-team")
    ).toBeInTheDocument();
  });

  it("shows copy button initially", () => {
    render(<InstallCommand {...mockProps} />);
    expect(screen.getByText("Copy Install Command")).toBeInTheDocument();
  });

  it("calls onCopy callback when copy button is clicked", async () => {
    const onCopy = vi.fn();
    render(<InstallCommand {...mockProps} onCopy={onCopy} />);

    const copyButton = screen.getByText("Copy Install Command");
    fireEvent.click(copyButton);

    expect(mockClipboard.writeText).toHaveBeenCalledWith(
      "npx clawdhub@latest install github claude-team"
    );
    expect(onCopy).toHaveBeenCalledWith(
      "npx clawdhub@latest install github claude-team"
    );
  });
});
