import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import SellerRegisterPage from "./page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock Navbar component
vi.mock("@/components/navbar", () => ({
  Navbar: () => <nav data-testid="navbar">Navbar</nav>,
}));

// Mock CreatorRegisterForm
vi.mock("@/components/seller/creator-register-form", () => ({
  CreatorRegisterForm: () => (
    <form data-testid="creator-form">CreatorRegisterForm</form>
  ),
}));

// Mock WalletConnect
vi.mock("@/components/wallet/connect", () => ({
  WalletConnect: () => (
    <div data-testid="wallet-connect">WalletConnect</div>
  ),
}));

describe("SellerRegisterPage", () => {
  beforeEach(() => {
    cleanup();
  });

  it("renders without crashing", () => {
    render(<SellerRegisterPage />);
    expect(screen.getByText("Become a Seller")).toBeInTheDocument();
  });

  it("renders Navbar component", () => {
    render(<SellerRegisterPage />);
    expect(screen.getAllByTestId("navbar")).toHaveLength(1);
  });

  it("renders page title", () => {
    render(<SellerRegisterPage />);
    expect(screen.getAllByText("Become a Seller")).toHaveLength(1);
  });

  it("renders subtitle", () => {
    render(<SellerRegisterPage />);
    expect(screen.getAllByText("List your skills and earn USDC")).toHaveLength(1);
  });

  it("renders WalletConnect component", () => {
    render(<SellerRegisterPage />);
    expect(screen.getAllByTestId("wallet-connect")).toHaveLength(1);
  });

  it("renders CreatorRegisterForm component", () => {
    render(<SellerRegisterPage />);
    expect(screen.getAllByTestId("creator-form")).toHaveLength(1);
  });

  it("has correct page structure with main element", () => {
    const { container } = render(<SellerRegisterPage />);
    const main = container.querySelector("main");
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass("min-h-screen", "pt-14");
  });

  it("renders section with correct styling", () => {
    const { container } = render(<SellerRegisterPage />);
    const section = container.querySelector("section");
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass("relative", "py-20", "overflow-hidden");
  });
});
