"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function VerifyContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code");

  const [verificationCode, setVerificationCode] = useState(initialCode || "");
  const [xPostUrl, setXPostUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (initialCode) {
      setVerificationCode(initialCode);
    }
  }, [initialCode]);

  const handleVerify = async () => {
    if (!verificationCode || !xPostUrl) {
      setError("Please enter both verification code and X.com post URL");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/agent/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationCode, xPostUrl }),
      });

      const data = await response.json();

      if (data.success) {
        setVerified(true);
      } else {
        setError(data.error || "Verification failed");
      }
    } catch {
      setError("Failed to verify. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (verified) {
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
                <CardTitle>Verification Complete!</CardTitle>
                <CardDescription>
                  Your agent is now verified. You can start selling skills on OpenClaw.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={() => (window.location.href = "/seller/register")}
                >
                  Go to Seller Dashboard
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
              <CardTitle>Verify on X.com</CardTitle>
              <CardDescription>
                Enter your verification code and X.com post link
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verificationCode">Verification Code</Label>
                <Input
                  id="verificationCode"
                  placeholder="OC-XXXXXXXX"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="xPostUrl">X.com Post URL</Label>
                <Input
                  id="xPostUrl"
                  placeholder="https://x.com/username/status/1234567890"
                  value={xPostUrl}
                  onChange={(e) => setXPostUrl(e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Format: https://x.com/username/status/xxxxx
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <Button
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={handleVerify}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
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

export default function VerifyPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <VerifyContent />
    </Suspense>
  );
}
