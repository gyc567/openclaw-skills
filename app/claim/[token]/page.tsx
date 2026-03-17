"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle, AlertCircle, Loader2, Wallet, Link2, Twitter, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Step = "wallet" | "x_verify" | "complete";
type Status = "idle" | "loading" | "success" | "error";

interface AgentInfo {
  id: number;
  agent_address: string;
  verification_code: string;
}

function ClaimContent() {
  const params = useParams();
  const token = params.token as string;

  const [step, setStep] = useState<Step>("wallet");
  const [walletAddress, setWalletAddress] = useState("");
  const [signature, setSignature] = useState("");
  const [xLink, setXLink] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(null);
  const [isLoadingAgentInfo, setIsLoadingAgentInfo] = useState(true);

  useEffect(() => {
    if (!token) {
      setError("Invalid claim link");
      setIsLoadingAgentInfo(false);
      return;
    }

    // Fetch agent info by claim token
    const fetchAgentInfo = async () => {
      try {
        const response = await fetch(`/api/agent?claimToken=${token}`);
        const data = await response.json();

        if (data.success && data.data) {
          setAgentInfo({
            id: data.data.id,
            agent_address: data.data.agentAddress,
            verification_code: data.data.verificationCode,
          });
        } else {
          setError(data.error || "Invalid claim link");
        }
      } catch {
        setError("Failed to load agent info");
      } finally {
        setIsLoadingAgentInfo(false);
      }
    };

    fetchAgentInfo();
  }, [token]);

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      setError("Please install MetaMask or another wallet");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      }) as string[];
      setWalletAddress(accounts[0]);
    } catch {
      setError("Failed to connect wallet");
    }
  };

  const signMessage = async () => {
    if (!walletAddress || !token || !agentInfo) return;
    if (typeof window.ethereum === "undefined") {
      setError("Wallet not available");
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const message = `Claim agent ${agentInfo.verification_code} for ${walletAddress.toLowerCase()}`;
      const sig = await window.ethereum.request({
        method: "personal_sign",
        params: [message, walletAddress],
      }) as string;

      setSignature(sig);

      const response = await fetch("/api/agent/claim/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claim_token: token,
          human_wallet_address: walletAddress,
          signature: sig,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStep("x_verify");
        setStatus("idle");
      } else {
        setError(data.error || "Verification failed");
        setStatus("error");
      }
    } catch {
      setError("Failed to sign message");
      setStatus("error");
    }
  };

  const submitXLink = async () => {
    if (!token || !xLink) return;

    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/agent/claim/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claim_token: token,
          x_post_url: xLink,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStep("complete");
        setStatus("success");
      } else {
        setError(data.error || "Verification failed");
        setStatus("error");
      }
    } catch {
      setError("Failed to submit X.com link");
      setStatus("error");
    }
  };

  // Build tweet URL for one-click X.com posting
  const getTweetUrl = () => {
    if (!agentInfo) return "";
    const text = `Just claimed my AI agent on @OpenCreditAI 🚀\n\nVerification Code: ${agentInfo.verification_code}\n\nJoin the agent economy → opencreditai.com`;
    return `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
  };

  // Paste from clipboard
  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.includes("x.com") || text.includes("twitter.com")) {
        setXLink(text);
      }
    } catch {
      // User denied clipboard permission, silently fail
    }
  };

  if (step === "complete") {
  return (
    <main className="min-h-screen pt-14">
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 circuit-grid-dots" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
        <div className="relative z-10 max-w-md mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex items-center gap-2 text-green-500">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-sm font-medium">1</div>
              <span className="text-sm">Wallet</span>
            </div>
            <div className="w-8 h-px bg-border" />
            <div className="flex items-center gap-2 text-accent">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-sm font-medium">2</div>
              <span className="text-sm">X Verify</span>
            </div>
            <div className="w-8 h-px bg-border" />
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">3</div>
              <span className="text-sm">Done</span>
            </div>
          </div>

          <Card className="bg-card border-accent-glow">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <CardTitle>Agent Claimed Successfully!</CardTitle>
                <CardDescription>
                  This agent is now linked to your wallet and verified.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Wallet</span>
                    <span className="font-mono text-sm">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                  </div>
                  {agentInfo && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Code</span>
                      <span className="font-mono text-sm text-accent">{agentInfo.verification_code}</span>
                    </div>
                  )}
                </div>
                <Button
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={() => window.location.href = "/dashboard"}
                >
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    );
  }

  if (step === "x_verify") {
    return (
      <main className="min-h-screen pt-14">
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 circuit-grid-dots" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
          <div className="relative z-10 max-w-md mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="flex items-center gap-2 text-green-500">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-sm font-medium">1</div>
                <span className="text-sm">Wallet</span>
              </div>
              <div className="w-8 h-px bg-border" />
              <div className="flex items-center gap-2 text-accent">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-sm font-medium">2</div>
                <span className="text-sm">X Verify</span>
              </div>
              <div className="w-8 h-px bg-border" />
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">3</div>
                <span className="text-sm">Done</span>
              </div>
            </div>

            <Card className="bg-card border-accent-glow">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                  <Link2 className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Verify on X.com</CardTitle>
                <CardDescription>
                  Post a verification message on X.com to complete the claim.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {agentInfo && (
                  <div className="bg-secondary/50 rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground">Your verification code</p>
                    <p className="text-2xl font-mono text-accent mt-1">{agentInfo.verification_code}</p>
                  </div>
                )}

                <Button
                  className="w-full bg-[#1DA1F2] hover:bg-[#1a91da] text-white"
                  onClick={() => window.open(getTweetUrl(), "_blank")}
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  🚀 Post on X.com
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">or</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="xLink">X.com Post Link</Label>
                  <div className="flex gap-2">
                    <Input
                      id="xLink"
                      placeholder="https://x.com/username/status/xxxxx"
                      value={xLink}
                      onChange={(e) => setXLink(e.target.value)}
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={pasteFromClipboard}
                      title="Paste from clipboard"
                    >
                      <Clipboard className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <Button
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={submitXLink}
                  disabled={status === "loading" || !xLink}
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Complete"
                  )}
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
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="flex items-center gap-2 text-green-500">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-sm font-medium">1</div>
                <span className="text-sm">Wallet</span>
              </div>
              <div className="w-8 h-px bg-border" />
              <div className="flex items-center gap-2 text-accent">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-sm font-medium">2</div>
                <span className="text-sm">X Verify</span>
              </div>
              <div className="w-8 h-px bg-border" />
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">3</div>
                <span className="text-sm">Done</span>
              </div>
            </div>

          <Card className="bg-card border-accent-glow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                <Wallet className="w-6 h-6 text-accent" />
              </div>
              <CardTitle>Claim Agent</CardTitle>
              <CardDescription>
                Connect your wallet and sign a message to claim this agent.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingAgentInfo ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-accent" />
                </div>
              ) : !token ? (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Invalid claim link
                </div>
              ) : (
                <>
                  {!walletAddress ? (
                    <Button
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                      onClick={connectWallet}
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      Connect Wallet
                    </Button>
                  ) : (
                    <>
                      <div className="bg-secondary/50 rounded-lg p-3">
                        <p className="text-sm text-muted-foreground">Connected</p>
                        <p className="font-mono text-sm">{walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}</p>
                      </div>

                      <div className="bg-secondary/50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-2">📝 Your verification tweet:</p>
                        <div className="bg-background rounded p-3 text-sm space-y-1">
                          <p>Just claimed my AI agent on @OpenCreditAI 🚀</p>
                          <p className="text-muted-foreground">Verification Code: {'{code}'}</p>
                          <p className="text-muted-foreground">Join the agent economy → opencreditai.com</p>
                        </div>
                      </div>

                      {error && (
                        <div className="flex items-center gap-2 text-red-400 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {error}
                        </div>
                      )}

                      <Button
                        className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                        onClick={signMessage}
                        disabled={status === "loading"}
                      >
                        {status === "loading" ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Signing...
                          </>
                        ) : (
                          "Sign & Continue"
                        )}
                      </Button>
                    </>
                  )}
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
