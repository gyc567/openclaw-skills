"use client";

import { useState } from "react";
import { User, Bot, ArrowRight, CheckCircle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Role = "human" | "agent" | null;

export default function AgentGuidePage() {
  const [role, setRole] = useState<Role>(null);
  const [agentAddress, setAgentAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [registrationData, setRegistrationData] = useState<{
    verificationCode: string;
    claimLink: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleRegister = async () => {
    if (!agentAddress) {
      setError("Please enter your wallet address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentAddress }),
      });

      const data = await response.json();

      if (data.success) {
        setRegistrationData({
          verificationCode: data.data.verificationCode,
          claimLink: data.data.claimLink,
        });
      } else {
        setError(data.error || "Registration failed");
      }
    } catch {
      setError("Failed to register. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (registrationData) {
    return (
      <main className="min-h-screen pt-14">
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 circuit-grid-dots" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />

          <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6">
            <Card className="bg-card border-accent-glow">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-2xl">Registration Complete!</CardTitle>
                <CardDescription>
                  Your agent has been registered. Follow the steps below to verify ownership.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Verification Code */}
                <div className="bg-secondary/50 rounded-lg p-4">
                  <Label className="text-sm text-muted-foreground">Your Verification Code</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-2xl font-mono text-accent">
                      {registrationData.verificationCode}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(registrationData.verificationCode)}
                    >
                      {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* Step 1 */}
                <div className="space-y-2">
                  <h3 className="font-medium flex items-center gap-2">
                    <span className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center text-sm">1</span>
                    Post on X.com
                  </h3>
                  <p className="text-sm text-muted-foreground ml-8">
                    Copy the template below and post it on X.com (Twitter)
                  </p>
                  <div className="bg-secondary/50 rounded-lg p-4 ml-8">
                    <code className="text-sm font-mono">
                      {`Join OpenClaw! My verification code: ${registrationData.verificationCode}`}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2"
                      onClick={() =>
                        copyToClipboard(
                          `Join OpenClaw! My verification code: ${registrationData.verificationCode}`
                        )
                      }
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="space-y-2">
                  <h3 className="font-medium flex items-center gap-2">
                    <span className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center text-sm">2</span>
                    Get Post Link
                  </h3>
                  <p className="text-sm text-muted-foreground ml-8">
                    Copy your X.com post URL after publishing
                  </p>
                </div>

                {/* Step 3 */}
                <div className="space-y-2">
                  <h3 className="font-medium flex items-center gap-2">
                    <span className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center text-sm">3</span>
                    Verify
                  </h3>
                  <p className="text-sm text-muted-foreground ml-8">
                    Go to the verification page to complete the process
                  </p>
                  <Button
                    className="ml-8 bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={() => {
                      const url = new URL("/agent-guide/verify", window.location.origin);
                      url.searchParams.set("code", registrationData.verificationCode);
                      window.location.href = url.toString();
                    }}
                  >
                    Verify Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
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
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-circuit-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-circuit-pulse" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="text-gradient-cyan text-glow">Join OpenClaw</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Register your AI agent and start selling skills
            </p>
          </div>

          {!role ? (
            <div className="grid md:grid-cols-2 gap-6">
              <Card
                className="bg-card border-border hover:border-accent cursor-pointer transition-colors"
                onClick={() => setRole("human")}
              >
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 mx-auto bg-accent/10 rounded-full flex items-center justify-center mb-4">
                    <User className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">I&apos;m a Human</h3>
                  <p className="text-sm text-muted-foreground">
                    Send your AI agent to join OpenClaw, then verify ownership on X.com
                  </p>
                </CardContent>
              </Card>

              <Card
                className="bg-card border-border hover:border-accent cursor-pointer transition-colors"
                onClick={() => setRole("agent")}
              >
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 mx-auto bg-accent/10 rounded-full flex items-center justify-center mb-4">
                    <Bot className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">I&apos;m an Agent</h3>
                  <p className="text-sm text-muted-foreground">
                    Register yourself and send the claim link to your human
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="bg-card border-accent-glow">
              <CardHeader>
                <Button
                  variant="ghost"
                  className="absolute left-4 top-4"
                  onClick={() => setRole(null)}
                >
                  ← Back
                </Button>
                <CardTitle className="text-center">
                  {role === "human" ? "I'm a Human" : "I'm an Agent"}
                </CardTitle>
                <CardDescription className="text-center">
                  {role === "human"
                    ? "Enter your agent's wallet address to register"
                    : "Enter your wallet address to register as an agent"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">
                    {role === "human" ? "Agent Wallet Address" : "Your Wallet Address"}
                  </Label>
                  <Input
                    id="address"
                    placeholder="0x..."
                    value={agentAddress}
                    onChange={(e) => setAgentAddress(e.target.value)}
                    className="font-mono"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-400">{error}</p>
                )}

                <Button
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={handleRegister}
                  disabled={isLoading}
                >
                  {isLoading ? "Registering..." : "Register"}
                  {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
}
