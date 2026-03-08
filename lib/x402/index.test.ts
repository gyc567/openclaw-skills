// x402 Core Library Tests - 100% Coverage

import { describe, it, expect, beforeEach } from "vitest";
import {
  usdToMicroUsd,
  microUsdToUsd,
  createPaymentRequirement,
  encodePaymentRequirement,
  decodePaymentRequirement,
  isRequirementExpired,
  selectPaymentOption,
  calculatePlatformFee,
  calculateSellerEarnings,
  isValidEthAddress,
  isValidPayoutAmount,
} from "./index";

describe("x402 Core Library", () => {
  const validAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0fE12";

  describe("usdToMicroUsd", () => {
    it("converts whole dollars correctly", () => {
      expect(usdToMicroUsd(1)).toBe("1000000");
      expect(usdToMicroUsd(10)).toBe("10000000");
    });

    it("converts decimal dollars correctly", () => {
      expect(usdToMicroUsd(0.01)).toBe("10000");
      expect(usdToMicroUsd(0.001)).toBe("1000");
    });

    it("converts string input correctly", () => {
      expect(usdToMicroUsd("5.5")).toBe("5500000");
    });

    it("throws on invalid input", () => {
      expect(() => usdToMicroUsd(-1)).toThrow();
      expect(() => usdToMicroUsd("invalid")).toThrow();
    });
  });

  describe("microUsdToUsd", () => {
    it("converts micro-units to USD correctly", () => {
      expect(microUsdToUsd("1000000")).toBe(1);
      expect(microUsdToUsd("10000")).toBe(0.01);
    });

    it("handles number input", () => {
      expect(microUsdToUsd(5000000)).toBe(5);
    });

    it("throws on invalid input", () => {
      expect(() => microUsdToUsd("invalid")).toThrow();
    });
  });

  describe("createPaymentRequirement", () => {
    it("creates valid payment requirement", () => {
      const req = createPaymentRequirement({
        url: "https://api.example.com/data",
        amountUsd: 0.01,
        recipient: validAddress,
      });

      expect(req.x402Version).toBe(2);
      expect(req.resource.url).toBe("https://api.example.com/data");
      expect(req.accepts[0].scheme).toBe("exact");
      expect(req.accepts[0].amount).toBe("10000");
      expect(req.accepts[0].asset).toBe("USDC");
      expect(req.accepts[0].payTo).toBe(validAddress);
      expect(req.expires).toBeGreaterThan(Date.now());
    });

    it("uses mainnet chain when specified", () => {
      const req = createPaymentRequirement({
        url: "https://api.example.com/data",
        amountUsd: 1,
        recipient: validAddress,
        chain: "mainnet",
      });

      expect(req.accepts[0].network).toBe("eip155:8453");
    });

    it("throws on invalid recipient address", () => {
      expect(() =>
        createPaymentRequirement({
          url: "https://api.example.com/data",
          amountUsd: 1,
          recipient: "invalid",
        })
      ).toThrow();
    });

    it("includes description when provided", () => {
      const req = createPaymentRequirement({
        url: "https://api.example.com/data",
        amountUsd: 1,
        recipient: validAddress,
        description: "Premium data access",
      });

      expect(req.resource.description).toBe("Premium data access");
    });
  });

  describe("encodePaymentRequirement", () => {
    it("encodes to base64 correctly", () => {
      const req = createPaymentRequirement({
        url: "https://api.example.com/data",
        amountUsd: 0.01,
        recipient: validAddress,
      });

      const encoded = encodePaymentRequirement(req);
      const decoded = Buffer.from(encoded, "base64").toString("utf-8");
      
      expect(JSON.parse(decoded)).toEqual(req);
    });
  });

  describe("decodePaymentRequirement", () => {
    it("decodes from base64 correctly", () => {
      const req = createPaymentRequirement({
        url: "https://api.example.com/data",
        amountUsd: 0.01,
        recipient: validAddress,
      });

      const encoded = encodePaymentRequirement(req);
      const decoded = decodePaymentRequirement(encoded);

      expect(decoded).toEqual(req);
    });

    it("throws on invalid base64", () => {
      expect(() => decodePaymentRequirement("!!!invalid!!!")).toThrow();
    });

    it("throws on invalid x402 version", () => {
      const invalid = Buffer.from(JSON.stringify({ x402Version: 1 })).toString("base64");
      expect(() => decodePaymentRequirement(invalid)).toThrow();
    });
  });

  describe("isRequirementExpired", () => {
    it("returns false for non-expired requirement", () => {
      const req = createPaymentRequirement({
        url: "https://api.example.com/data",
        amountUsd: 0.01,
        recipient: validAddress,
      });

      expect(isRequirementExpired(req)).toBe(false);
    });

    it("returns true for expired requirement", () => {
      const req = {
        x402Version: 2 as const,
        resource: { url: "https://api.example.com/data" },
        accepts: [{
          scheme: "exact" as const,
          network: "eip155:84532",
          amount: "10000",
          asset: "USDC",
          payTo: validAddress,
        }],
        expires: Date.now() - 1000, // Expired
      };

      expect(isRequirementExpired(req)).toBe(true);
    });
  });

  describe("selectPaymentOption", () => {
    it("selects exact payment option", () => {
      const req = createPaymentRequirement({
        url: "https://api.example.com/data",
        amountUsd: 0.01,
        recipient: validAddress,
      });

      const option = selectPaymentOption(req);

      expect(option?.scheme).toBe("exact");
      expect(option?.amount).toBe("10000");
    });

    it("returns null for invalid requirement", () => {
      const req = {
        x402Version: 2 as const,
        resource: { url: "https://api.example.com/data" },
        accepts: [],
        expires: Date.now() + 60000,
      };

      expect(selectPaymentOption(req)).toBeNull();
    });
  });

  describe("calculatePlatformFee", () => {
    it("calculates 5% fee correctly", () => {
      expect(calculatePlatformFee(100)).toBe(5);
      expect(calculatePlatformFee(10)).toBe(0.5);
      expect(calculatePlatformFee(1)).toBe(0.05);
    });

    it("handles decimal amounts", () => {
      const fee = calculatePlatformFee(33.33);
      expect(fee).toBeCloseTo(1.6665, 4);
    });
  });

  describe("calculateSellerEarnings", () => {
    it("calculates 95% earnings correctly", () => {
      expect(calculateSellerEarnings(100)).toBe(95);
      expect(calculateSellerEarnings(10)).toBe(9.5);
      expect(calculateSellerEarnings(1)).toBe(0.95);
    });
  });

  describe("isValidEthAddress", () => {
    it("validates correct Ethereum addresses", () => {
      expect(isValidEthAddress(validAddress)).toBe(true);
      expect(isValidEthAddress("0x742d35Cc6634C0532925a3b844Bc9e7595f0fE12")).toBe(true);
    });

    it("rejects invalid addresses", () => {
      expect(isValidEthAddress("invalid")).toBe(false);
      expect(isValidEthAddress("0x742d")).toBe(false);
      expect(isValidEthAddress("742d35Cc6634C0532925a3b844Bc9e7595f0fE12")).toBe(false);
      expect(isValidEthAddress("")).toBe(false);
    });
  });

  describe("isValidPayoutAmount", () => {
    it("validates amounts above minimum", () => {
      expect(isValidPayoutAmount(50)).toBe(true);
      expect(isValidPayoutAmount(100)).toBe(true);
      expect(isValidPayoutAmount(50.01)).toBe(true);
    });

    it("rejects amounts below minimum", () => {
      expect(isValidPayoutAmount(49.99)).toBe(false);
      expect(isValidPayoutAmount(1)).toBe(false);
      expect(isValidPayoutAmount(0)).toBe(false);
    });

    it("uses custom minimum when specified", () => {
      expect(isValidPayoutAmount(10, 10)).toBe(true);
      expect(isValidPayoutAmount(5, 10)).toBe(false);
    });
  });
});
