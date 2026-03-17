// Agent API Tests - Simplified

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database client
vi.mock("@/lib/db/client", () => ({
  query: vi.fn(),
}));

import { query } from "@/lib/db/client";
import { POST as AgentRegisterPOST, GET as AgentGet } from "@/app/api/agent/route";
import { POST as ClaimPOST } from "@/app/api/agent/claim/route";
import { POST as VerifyPOST } from "@/app/api/agent/verify/route";
import { NextRequest } from "next/server";

const mockQuery = query as ReturnType<typeof vi.fn>;

describe("Agent Registration API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/agent", () => {
    const validAgentAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0fE12";

    it("registers agent with valid address", async () => {
      mockQuery.mockResolvedValueOnce([
        {
          id: 1,
          verification_code: "OC-ABC12345",
          claim_token: "abc123def456",
          claim_token_expires: new Date(Date.now() + 86400000),
        },
      ]);

      const req = new NextRequest("http://localhost:3000/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentAddress: validAgentAddress }),
      });

      const res = await AgentRegisterPOST(req);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.data.verificationCode).toMatch(/^OC-[A-Z0-9]{8}$/);
      expect(data.data.claimLink).toContain("/claim/");
    });

    it("rejects invalid agent address", async () => {
      const req = new NextRequest("http://localhost:3000/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentAddress: "invalid-address" }),
      });

      const res = await AgentRegisterPOST(req);
      const data = await res.json();

      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid agent wallet address");
      expect(res.status).toBe(400);
    });

    it("rejects missing agent address", async () => {
      const req = new NextRequest("http://localhost:3000/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const res = await AgentRegisterPOST(req);
      const data = await res.json();

      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid agent wallet address");
      expect(res.status).toBe(400);
    });

    it("validates human address when provided", async () => {
      const req = new NextRequest("http://localhost:3000/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentAddress: validAgentAddress,
          humanAddress: "invalid",
        }),
      });

      const res = await AgentRegisterPOST(req);
      const data = await res.json();

      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid human wallet address");
      expect(res.status).toBe(400);
    });

    it("handles database errors gracefully", async () => {
      mockQuery.mockRejectedValueOnce(new Error("Database error"));

      const req = new NextRequest("http://localhost:3000/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentAddress: validAgentAddress }),
      });

      const res = await AgentRegisterPOST(req);
      const data = await res.json();

      expect(data.success).toBe(false);
      expect(res.status).toBe(500);
    });
  });

  describe("GET /api/agent", () => {
    it("requires verification code or claim token", async () => {
      const req = new NextRequest("http://localhost:3000/api/agent");
      const res = await AgentGet(req);
      const data = await res.json();

      expect(data.success).toBe(false);
      expect(data.error).toBe("verificationCode or claimToken is required");
      expect(res.status).toBe(400);
    });

    it("returns error for non-existent registration", async () => {
      mockQuery.mockResolvedValueOnce([]);

      const req = new NextRequest("http://localhost:3000/api/agent?verificationCode=OC-NONEXIST");
      const res = await AgentGet(req);
      const data = await res.json();

      expect(data.success).toBe(false);
      expect(res.status).toBe(404);
    });
  });
});

describe("Agent Claim API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/agent/claim", () => {
    it("rejects missing claim token", async () => {
      const req = new NextRequest("http://localhost:3000/api/agent/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const res = await ClaimPOST(req);
      const data = await res.json();

      expect(data.success).toBe(false);
      expect(data.error).toContain("claimToken");
    });

    it("handles database errors gracefully", async () => {
      mockQuery.mockRejectedValueOnce(new Error("Database error"));

      const req = new NextRequest("http://localhost:3000/api/agent/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimToken: "some-token" }),
      });

      const res = await ClaimPOST(req);
      const data = await res.json();

      expect(data.success).toBe(false);
      expect(res.status).toBe(500);
    });
  });
});

describe("Agent Verify API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/agent/verify", () => {
    it("rejects invalid X.com URL format", async () => {
      const req = new NextRequest("http://localhost:3000/api/agent/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verificationCode: "OC-ABC12345",
          xPostUrl: "https://twitter.com/user/status/123",
        }),
      });

      const res = await VerifyPOST(req);
      const data = await res.json();

      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid X.com post URL format");
      expect(res.status).toBe(400);
    });

    it("rejects missing verification code and xPostUrl", async () => {
      const req = new NextRequest("http://localhost:3000/api/agent/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const res = await VerifyPOST(req);
      const data = await res.json();

      expect(data.success).toBe(false);
      expect(data.error).toBe("verificationCode and xPostUrl are required");
      expect(res.status).toBe(400);
    });

    it("validates X URL format strictly (x.com only)", async () => {
      const invalidUrls = [
        "https://x.com/user/status/123",          // Missing /status/
        "https://x.com/user/123",                 // Wrong path
        "https://twitter.com/user/status/123",    // Wrong domain
        "http://x.com/user/status/123",           // Not HTTPS
      ];

      for (const url of invalidUrls) {
        const req = new NextRequest("http://localhost:3000/api/agent/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            verificationCode: "OC-ABC12345",
            xPostUrl: url,
          }),
        });

        const res = await VerifyPOST(req);
        const data = await res.json();

        expect(data.success).toBe(false);
      }
    });

    it("handles database errors gracefully", async () => {
      mockQuery.mockRejectedValueOnce(new Error("Database error"));

      const req = new NextRequest("http://localhost:3000/api/agent/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verificationCode: "OC-ABC12345",
          xPostUrl: "https://x.com/user/status/1234567890",
        }),
      });

      const res = await VerifyPOST(req);
      const data = await res.json();

      expect(data.success).toBe(false);
      expect(res.status).toBe(500);
    });

    it("accepts valid X.com URL format", async () => {
      mockQuery.mockResolvedValueOnce([
        {
          id: 1,
          agent_address: "0x742d35cc6634c0532925a3b844bc9e7595f0fe12",
          verification_code: "OC-ABC12345",
          status: "pending",
        },
      ]);

      mockQuery.mockResolvedValueOnce([{ id: 1 }]);

      const req = new NextRequest("http://localhost:3000/api/agent/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verificationCode: "OC-ABC12345",
          xPostUrl: "https://x.com/user/status/1234567890",
        }),
      });

      const res = await VerifyPOST(req);
      const data = await res.json();

      expect(data.success).toBe(true);
    });
  });
});
