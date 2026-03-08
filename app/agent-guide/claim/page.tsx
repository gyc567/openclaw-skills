"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ClaimContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [humanAddress, setHumanAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Invalid claim link. Please check your URL.");
    }
  }, [token]);

  const handleClaim = async () => {
    if (!token) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/agent/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimToken: token, humanAddress }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setVerificationCode(data.data.verificationCode);
      } else {
        setError(data.error || "Claim failed");
      }
    } catch {
      setError("Failed to claim. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen pt-14">
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 circuit-grid-dots" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />

          <div className="relative z-10 max-w-md mx-auto px-4 sm:px-6">
            <Card className="bg-card border-accent-glow">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <CardTitle>Claimed Successfully!</CardTitle>
                <CardDescription>
                  Your agent has been claimed. Now verify ownership on X.com.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-secondary/50 rounded-lg p-4 text-center">
                  <Label className="text-sm text-muted-foreground">Verification Code</Label>
                  <p className="text-2xl font-mono text-accent mt-1">{verificationCode}</p>
                </div>

                <Button
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={() => {
                    const url = new URL("/agent-guide/verify", window.location.origin);
                    url.searchParams.set("code", verificationCode);
                    window.location.href = url.toString();
                  }}
                >
                  Verify on X.com
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-14">
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 circuit-grid-dots" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />

        <div className="relative z-10 max-w-md mx-auto px-4 sm:px-6">
          <Card className="bg-card border-accent-glow">
            <CardHeader className="text-center">
              <CardTitle>Claim Agent</CardTitle>
              <CardDescription>
                {token ? "Connect your wallet to claim this agent" : "Invalid claim link"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && !token && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              {token && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="humanAddress">Your Wallet Address (Optional)</Label>
                    <Input
                      id="humanAddress"
                      placeholder="0x..."
                      value={humanAddress}
                      onChange={(e) => setHumanAddress(e.target.value)}
                      className="font-mono"
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}

                  <Button
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={handleClaim}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Claiming...
                      </>
                    ) : (
                      "Claim Agent"
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

function LoadingState() {
  return (
    <main className="min-h-screen pt-14">
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 circuit-grid-dots" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
        <div className="relative z-10 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </section>
    </main>
  );
}

export default function ClaimPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ClaimContent />
    </Suspense>
  );
}
