import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  registerAgent,
  getClaimStatus,
  parseXLink,
  isValidXLink,
} from "./client";

// Mock fetch
global.fetch = vi.fn();

describe("Agent Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("registerAgent", () => {
    it("should call POST /api/agent with correct body", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: 1,
            verificationCode: "OC-ABC12345",
            claimToken: "abc123def456",
            claimLink: "https://opencreditai.com/claim/abc123def456",
          },
        }),
      } as Response);

      const result = await registerAgent({
        wallet_address: "0x1234567890123456789012345678901234567890",
      } as any);

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/agent",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            wallet_address: "0x1234567890123456789012345678901234567890",
          }),
        })
      );

      expect(result.success).toBe(true);
      expect((result as any).data?.verificationCode).toBe("OC-ABC12345");
    });

    it("should throw error on failed response", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: "Invalid address" }),
      } as Response);

    await expect(
      registerAgent({ wallet_address: "invalid" } as any)
    ).rejects.toThrow("Invalid address");
    });
  });

  describe("getClaimStatus", () => {
    it("should call GET /api/agent?claimToken=xxx (NOT /api/agent/status)", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: 1,
            status: "pending",
            verificationCode: "OC-ABC12345",
          },
        }),
      } as Response);

      const result = await getClaimStatus("abc123def456") as any;

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/agent?claimToken=abc123def456",
        expect.objectContaining({
          headers: { "Content-Type": "application/json" },
        })
      );

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe("pending");
    });

    it("should handle verified status", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: 1,
            status: "verified",
            xVerified: true,
            xHandle: "@human",
          },
        }),
      } as Response);

      const result = await getClaimStatus("abc123def456") as any;

      expect(result.data?.status).toBe("verified");
    });
  });

  describe("parseXLink", () => {
    it("should parse x.com URL correctly", () => {
      const result = parseXLink("https://x.com/user/status/1234567890");
      expect(result).toEqual({ username: "user", postId: "1234567890" });
    });

    it("should parse twitter.com URL correctly", () => {
      const result = parseXLink("https://twitter.com/user/status/1234567890");
      expect(result).toEqual({ username: "user", postId: "1234567890" });
    });

    it("should return null for invalid URL", () => {
      expect(parseXLink("https://facebook.com/user/post")).toBeNull();
      expect(parseXLink("not-a-url")).toBeNull();
    });
  });

  describe("isValidXLink", () => {
    it("should return true for valid x.com link", () => {
      expect(isValidXLink("https://x.com/user/status/123")).toBe(true);
    });

    it("should return false for invalid link", () => {
      expect(isValidXLink("https://facebook.com/user/post")).toBe(false);
    });
  });
});
