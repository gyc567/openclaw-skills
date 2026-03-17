"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StatsCard } from "@/components/seller/stats-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WalletConnect } from "@/components/wallet/connect";
import { Plus, Loader2 } from "lucide-react";

interface Creator {
  id: string;
  username: string;
  displayName: string;
  totalEarnings: number;
  totalSales: number;
  rating: number;
}

interface Listing {
  id: number;
  name: string;
  description: string;
  category: string;
  priceUsd: number;
  isPublished: boolean;
  createdAt: string;
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const creatorId = searchParams.get("creatorId");

  const [walletAddress, setWalletAddress] = useState<string>("");
  const [creator, setCreator] = useState<Creator | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (creatorId) {
      fetchCreatorData(creatorId);
    } else {
      setIsLoading(false);
    }
  }, [creatorId]);

  const fetchCreatorData = async (id: string) => {
    try {
      const response = await fetch(`/api/v1/creators/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCreator(data.data);
      }

      const listingsResponse = await fetch(`/api/v1/creators/${id}/listings`);
      if (listingsResponse.ok) {
        const listingsData = await listingsResponse.json();
        setListings(listingsData.data || []);
      }
    } catch (error) {
      console.error("Error fetching creator data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = (address: string) => {
    setWalletAddress(address);
  };

  if (!creatorId) {
    return (
      <main className="min-h-screen pt-14">
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 circuit-grid-dots" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />

          <div className="relative z-10 max-w-md mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="text-gradient-cyan text-glow">Seller Dashboard</span>
            </h1>
            <p className="text-muted-foreground mb-8">
              Connect your wallet to view your seller dashboard
            </p>
            <WalletConnect
              onConnect={handleConnect}
              onDisconnect={() => setWalletAddress("")}
            />
            <div className="mt-6">
              <Button variant="outline" onClick={() => router.push("/seller/register")}>
                Or register as a new seller
              </Button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="min-h-screen pt-14">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-14">
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                {creator?.displayName || creator?.username}
              </h1>
              <p className="text-muted-foreground">Seller Dashboard</p>
            </div>
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => router.push(`/seller/listings/new?creatorId=${creatorId}`)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Listing
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="Total Earnings"
              value={`$${typeof creator?.totalEarnings === 'number' ? creator.totalEarnings.toFixed(2) : Number(creator?.totalEarnings || 0).toFixed(2)}`}
              icon="dollar"
            />
            <StatsCard
              title="Total Sales"
              value={creator?.totalSales || 0}
              icon="cart"
            />
            <StatsCard
              title="Rating"
              value={typeof creator?.rating === 'number' ? creator.rating.toFixed(1) : Number(creator?.rating || 0).toFixed(1)}
              icon="star"
            />
          </div>

          <Card className="bg-secondary/50 border-accent-glow">
            <CardHeader>
              <CardTitle>Your Listings</CardTitle>
            </CardHeader>
            <CardContent>
              {listings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    You haven&apos;t listed any skills yet
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/seller/listings/new?creatorId=${creatorId}`)}
                  >
                    Create your first listing
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {listings.map((listing) => (
                    <div
                      key={listing.id}
                      className="flex items-center justify-between p-4 bg-background rounded-lg border border-border"
                    >
                      <div>
                        <h3 className="font-medium">{listing.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {listing.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">{listing.category}</Badge>
                          <Badge variant={listing.isPublished ? "default" : "outline"}>
                            {listing.isPublished ? "Published" : "Draft"}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-accent">
                          ${listing.priceUsd}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    </main>
  );
}

export default function SellerDashboardPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <DashboardContent />
    </Suspense>
  );
}
