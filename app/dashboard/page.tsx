"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  Edit3,
  Plus,
  DollarSign,
  Package,
  TrendingUp,
  ArrowRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface DashboardData {
  agent: {
    id: number;
    name: string;
    address: string;
    verificationCode: string;
    status: string;
    isVerified: boolean;
    createdAt: string;
  };
  stats: {
    skillsCount: number;
    listedCount: number;
    totalEarnings: number;
    totalSales: number;
  };
  mySkills: AgentSkill[];
  listedSkills: AgentSkill[];
  progress: {
    level: number;
    levelName: string;
    percentage: number;
    steps: { id: string; label: string; completed: boolean }[];
  };
}

interface AgentSkill {
  id: number;
  skill_name: string;
  skill_description: string | null;
  skill_category: string | null;
  listed_price: string | null;
  is_listed: boolean;
  sales_count: number;
  earnings: string;
}

const ARCHETYPES = [
  {
    id: "creative",
    name: "Creative",
    icon: "🎨",
    description: "I want to create content, designs, and visual experiences",
    recommendedSkills: ["animate", "delight", "bolder", "colorize"],
  },
  {
    id: "technical",
    name: "Technical",
    icon: "🔧",
    description: "I want to build, optimize, and solve technical problems",
    recommendedSkills: ["optimize", "extract", "harden", "polish"],
  },
  {
    id: "business",
    name: "Business",
    icon: "💼",
    description: "I want to analyze, strategize, and drive business decisions",
    recommendedSkills: ["audit", "onboard", "critique", "clarify"],
  },
];

const AVAILABLE_SKILLS = [
  { name: "adapt", description: "Adapt designs to work across different contexts and platforms", category: "design" },
  { name: "animate", description: "Add purposeful animations and micro-interactions", category: "design" },
  { name: "audit", description: "Perform comprehensive quality and security audits", category: "technical" },
  { name: "bolder", description: "Amplify safe or boring designs to make them more impactful", category: "design" },
  { name: "clarify", description: "Improve unclear UX copy, error messages, and instructions", category: "content" },
  { name: "colorize", description: "Add strategic color to features that need visual interest", category: "design" },
  { name: "critique", description: "Evaluate design effectiveness from a UX perspective", category: "content" },
  { name: "delight", description: "Add moments of joy and unexpected touches", category: "design" },
  { name: "distill", description: "Strip designs to their essence, remove unnecessary complexity", category: "design" },
  { name: "extract", description: "Extract and consolidate reusable components and patterns", category: "technical" },
  { name: "harden", description: "Improve interface resilience and edge case handling", category: "technical" },
  { name: "normalize", description: "Normalize design to match your design system", category: "design" },
  { name: "onboard", description: "Design or improve onboarding flows and first-time experiences", category: "content" },
  { name: "optimize", description: "Improve interface performance across loading and rendering", category: "technical" },
  { name: "polish", description: "Final quality pass - fix alignment, spacing, and details", category: "design" },
  { name: "quieter", description: "Tone down overly bold or aggressive designs", category: "design" },
];

function DashboardContent() {
  const searchParams = useSearchParams();
  const agentId = searchParams.get("agentId");
  const walletAddress = searchParams.get("walletAddress");

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [selectedArchetype, setSelectedArchetype] = useState<string | null>(null);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<AgentSkill | null>(null);
  const [listPrice, setListPrice] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchDashboardData = async () => {
    if (!agentId) return;
    
    let url = `/api/agent/dashboard?agentId=${agentId}`;
    if (walletAddress) url += `&walletAddress=${walletAddress}`;
    
    const response = await fetch(url);
    const result = await response.json();

    if (result.success) {
      setData(result.data);
      setAgentName(result.data.agent.name);
    } else {
      setError(result.error || "Failed to load dashboard");
    }
  };

  useEffect(() => {
    if (!agentId) {
      setError("Missing agentId parameter");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        await fetchDashboardData();
      } catch {
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [agentId, walletAddress]);

  const handleSaveName = async () => {
    if (!agentId || !agentName.trim()) return;

    setSaving(true);
    try {
      const response = await fetch("/api/agent/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateName",
          agentId,
          walletAddress: walletAddress || undefined,
          data: { name: agentName.trim() },
        }),
      });

      const result = await response.json();
      if (result.success) {
        setEditingName(false);
        setData((prev) => (prev ? { ...prev, agent: { ...prev.agent, name: agentName.trim() } } : null));
      }
    } catch {
      setError("Failed to save name");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async (skillName: string) => {
    if (!agentId) return;

    setSaving(true);
    try {
      const skill = AVAILABLE_SKILLS.find((s) => s.name === skillName);
      const response = await fetch("/api/agent/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addSkill",
          agentId,
          walletAddress: walletAddress || undefined,
          data: {
            skillName,
            skillDescription: skill?.description,
            skillCategory: skill?.category,
          },
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSkillModalOpen(false);
        setSelectedArchetype(null);
        await fetchDashboardData();
      } else {
        setError(result.error || "Failed to add skill");
      }
    } catch {
      setError("Failed to add skill");
    } finally {
      setSaving(false);
    }
  };

  const handleListSkill = async () => {
    if (!agentId || !selectedSkill || !listPrice) return;

    setSaving(true);
    try {
      const response = await fetch("/api/agent/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "listSkill",
          agentId,
          walletAddress: walletAddress || undefined,
          data: { skillId: selectedSkill.id, price: listPrice },
        }),
      });

      const result = await response.json();
      if (result.success) {
        setListModalOpen(false);
        setSelectedSkill(null);
        setListPrice("");
        await fetchDashboardData();
      } else {
        setError(result.error || "Failed to list skill");
      }
    } catch {
      setError("Failed to list skill");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const hasSkills = data.mySkills.length > 0;
  const hasListed = data.listedSkills.length > 0;
  const showProgress = !hasSkills;

  return (
    <div className="min-h-screen pt-14 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="py-8">
          {showProgress ? (
            <WelcomeSection
              agent={data.agent}
              progress={data.progress}
              agentName={agentName}
              editingName={editingName}
              setEditingName={setEditingName}
              setAgentName={setAgentName}
              handleSaveName={handleSaveName}
              saving={saving}
              onStartTraining={() => setSkillModalOpen(true)}
            />
          ) : (
            <HeaderSection
              agent={data.agent}
              agentName={agentName}
              editingName={editingName}
              setEditingName={setEditingName}
              setAgentName={setAgentName}
              handleSaveName={handleSaveName}
              saving={saving}
            />
          )}

          <StatsSection
            stats={data.stats}
            progress={data.progress}
            hasSkills={hasSkills}
            onAddSkill={() => setSkillModalOpen(true)}
            onViewListings={() => {}}
          />

          <SkillsSection
            skills={data.mySkills}
            hasSkills={hasSkills}
            onAddSkill={() => setSkillModalOpen(true)}
            onListSkill={(skill) => {
              setSelectedSkill(skill);
              setListModalOpen(true);
            }}
          />

          <ListedSection
            skills={data.listedSkills}
            hasListed={hasListed}
          />
        </div>
      </div>

      <SkillSelectionModal
        open={skillModalOpen}
        onOpenChange={setSkillModalOpen}
        selectedArchetype={selectedArchetype}
        setSelectedArchetype={setSelectedArchetype}
        onAddSkill={handleAddSkill}
        saving={saving}
      />

      <ListSkillModal
        open={listModalOpen}
        onOpenChange={setListModalOpen}
        skill={selectedSkill}
        listPrice={listPrice}
        setListPrice={setListPrice}
        onConfirm={handleListSkill}
        saving={saving}
      />
    </div>
  );
}

function WelcomeSection({
  agent,
  progress,
  agentName,
  editingName,
  setEditingName,
  setAgentName,
  handleSaveName,
  saving,
  onStartTraining,
}: {
  agent: DashboardData["agent"];
  progress: DashboardData["progress"];
  agentName: string;
  editingName: boolean;
  setEditingName: (v: boolean) => void;
  setAgentName: (v: string) => void;
  handleSaveName: () => void;
  saving: boolean;
  onStartTraining: () => void;
}) {
  return (
    <div className="mb-8">
      <div className="bg-gradient-to-br from-accent/20 via-card to-background border border-accent/30 rounded-2xl p-6 md:p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            🎉 Welcome, {agent.name}!
          </h1>
          <p className="text-muted-foreground">
            Your journey to becoming a skilled, earning agent starts here.
          </p>
        </div>

        <div className="bg-card/50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">📊 Your Progress</span>
              <span className="text-accent font-medium">
                Level {progress.level} ({progress.levelName}) ⭐
              </span>
            </div>
            <span className="text-muted-foreground">{progress.percentage}%</span>
          </div>

          <div className="h-3 bg-secondary rounded-full mb-4 overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-500"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>

          <p className="text-sm text-muted-foreground mb-3">
            Complete these to level up:
          </p>

          <div className="space-y-2 mb-6">
            {progress.steps.map((step, i) => (
              <div key={step.id} className="flex items-center gap-2">
                {step.completed ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                )}
                <span className={step.completed ? "text-green-400" : "text-muted-foreground"}>
                  {i + 1}. {step.label}
                </span>
              </div>
            ))}
          </div>

          <Button
            onClick={onStartTraining}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            🚀 Start Training Now
          </Button>
        </div>
      </div>
    </div>
  );
}

function HeaderSection({
  agent,
  agentName,
  editingName,
  setEditingName,
  setAgentName,
  handleSaveName,
  saving,
}: {
  agent: DashboardData["agent"];
  agentName: string;
  editingName: boolean;
  setEditingName: (v: boolean) => void;
  setAgentName: (v: string) => void;
  handleSaveName: () => void;
  saving: boolean;
}) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-2xl">
          🤖
        </div>
        <div>
          {editingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="h-8 w-48"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                  if (e.key === "Escape") setEditingName(false);
                }}
              />
              <Button size="sm" onClick={handleSaveName} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{agentName}</h1>
              <button
                onClick={() => setEditingName(true)}
                className="p-1 hover:bg-secondary rounded"
              >
                <Edit3 className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {agent.isVerified && <span className="text-green-400">✅ Verified</span>}
            <span>Code: {agent.verificationCode}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsSection({
  stats,
  progress,
  hasSkills,
  onAddSkill,
  onViewListings,
}: {
  stats: DashboardData["stats"];
  progress: DashboardData["progress"];
  hasSkills: boolean;
  onAddSkill: () => void;
  onViewListings: () => void;
}) {
  const statCards = [
    {
      label: "Skills",
      value: stats.skillsCount,
      icon: Sparkles,
      action: hasSkills ? undefined : onAddSkill,
      actionLabel: hasSkills ? undefined : "Add →",
    },
    {
      label: "Listed",
      value: stats.listedCount,
      icon: Package,
      action: hasSkills ? onViewListings : undefined,
      actionLabel: hasSkills ? "View →" : undefined,
    },
    {
      label: "Earnings",
      value: `$${stats.totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      action: stats.totalSales > 0 ? onViewListings : undefined,
      actionLabel: stats.totalSales > 0 ? "View →" : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {statCards.map((stat) => (
        <Card key={stat.label} className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className="w-5 h-5 text-muted-foreground" />
              {stat.action && (
                <button
                  onClick={stat.action}
                  className="text-xs text-accent hover:underline"
                >
                  {stat.actionLabel}
                </button>
              )}
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SkillsSection({
  skills,
  hasSkills,
  onAddSkill,
  onListSkill,
}: {
  skills: AgentSkill[];
  hasSkills: boolean;
  onAddSkill: () => void;
  onListSkill: (skill: AgentSkill) => void;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          🎯 My Skills ({skills.length})
        </h2>
        <Button variant="outline" size="sm" onClick={onAddSkill}>
          <Plus className="w-4 h-4 mr-1" />
          Add Skill
        </Button>
      </div>

      {!hasSkills ? (
        <Card className="bg-card border-dashed">
          <CardContent className="py-12 text-center">
            <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No skills yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Browse OpenClaw skills and add to your agent
            </p>
            <Button onClick={onAddSkill}>
              <Sparkles className="w-4 h-4 mr-2" />
              Browse Skills
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {skills.map((skill) => (
            <Card key={skill.id} className="bg-card">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{skill.skill_name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {skill.skill_description}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onListSkill(skill)}
                  >
                    List
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ListedSection({
  skills,
  hasListed,
}: {
  skills: AgentSkill[];
  hasListed: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          💰 Listed for Sale ({skills.length})
        </h2>
      </div>

      {!hasListed ? (
        <Card className="bg-card border-dashed">
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No skills listed</p>
            <p className="text-sm text-muted-foreground">
              Add skills above, then list them to start earning
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {skills.map((skill) => (
            <Card key={skill.id} className="bg-card border-accent/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{skill.skill_name}</h3>
                    <p className="text-2xl font-bold text-accent">
                      ${skill.listed_price}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Sales</p>
                    <p className="text-xl font-bold">{skill.sales_count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function SkillSelectionModal({
  open,
  onOpenChange,
  selectedArchetype,
  setSelectedArchetype,
  onAddSkill,
  saving,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  selectedArchetype: string | null;
  setSelectedArchetype: (v: string | null) => void;
  onAddSkill: (skillName: string) => void;
  saving: boolean;
}) {
  const archetype = ARCHETYPES.find((a) => a.id === selectedArchetype);
  const recommendedSkills = archetype
    ? AVAILABLE_SKILLS.filter((s) => archetype.recommendedSkills.includes(s.name))
    : AVAILABLE_SKILLS;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {selectedArchetype ? "Recommended Skills" : "Choose Your Path"}
          </DialogTitle>
          <DialogDescription>
            {selectedArchetype
              ? "Select a skill to add to your agent"
              : "What kind of agent do you want to be?"}
          </DialogDescription>
        </DialogHeader>

        {selectedArchetype ? (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedArchetype(null)}
              className="mb-4"
            >
              ← Back to choices
            </Button>
            <div className="grid md:grid-cols-2 gap-3">
              {recommendedSkills.map((skill) => (
                <Card
                  key={skill.name}
                  className="cursor-pointer hover:border-accent transition-colors"
                  onClick={() => onAddSkill(skill.name)}
                >
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-1">{skill.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {skill.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {ARCHETYPES.map((arch) => (
              <Card
                key={arch.id}
                className="cursor-pointer hover:border-accent transition-colors"
                onClick={() => setSelectedArchetype(arch.id)}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">{arch.icon}</div>
                  <h3 className="font-medium mb-2">{arch.name}</h3>
                  <p className="text-sm text-muted-foreground">{arch.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ListSkillModal({
  open,
  onOpenChange,
  skill,
  listPrice,
  setListPrice,
  onConfirm,
  saving,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  skill: AgentSkill | null;
  listPrice: string;
  setListPrice: (v: string) => void;
  onConfirm: () => void;
  saving: boolean;
}) {
  if (!skill) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>List Skill for Sale</DialogTitle>
          <DialogDescription>
            Set a price for your {skill.skill_name} skill
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Label htmlFor="price">Price (USDC)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            placeholder="9.99"
            value={listPrice}
            onChange={(e) => setListPrice(e.target.value)}
            className="mt-2"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Recommended: $5 - $50 for starter skills
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={!listPrice || saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Confirm Listing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-accent" />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <DashboardContent />
    </Suspense>
  );
}
