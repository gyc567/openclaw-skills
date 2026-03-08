"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { skills, categories } from "@/lib/skills-data";
import { 
  Terminal, 
  Zap, 
  BookOpen, 
  Rocket, 
  CheckCircle, 
  Copy, 
  ArrowRight,
  Cpu,
  Layers,
  Sparkles
} from "lucide-react";
import { useState } from "react";

const beginnerSkills = [
  "github", "github-pr", "read-github", "claude-team", "cursor-agent"
];

const intermediateSkills = [
  "discord", "slack", "cloudflare", "kubectl-skill", "supabase",
  "vercel-react-best-practices", "frontend-design", "openai"
];

const advancedSkills = [
  "conventional-commits", "codex-monitor", "agentlens", "digital-ocean",
  "hetzner-cloud", "opencode-acp-control", "ui-audit"
];

const allRecommendedSkills = [...beginnerSkills, ...intermediateSkills, ...advancedSkills];

export default function ClawDojoPage() {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [installAllCopied, setInstallAllCopied] = useState(false);

  const handleCopy = (text: string, index: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = () => {
    const command = `npx clawdhub@latest install ${allRecommendedSkills.join(" ")}`;
    navigator.clipboard.writeText(command);
    setInstallAllCopied(true);
    setTimeout(() => setInstallAllCopied(false), 2000);
  };

  const getSkillById = (id: string) => skills.find(s => s.id === id);

  const SkillLevelCard = ({ 
    level, 
    icon: Icon, 
    color, 
    skillIds,
    description 
  }: { 
    level: string;
    icon: React.ElementType;
    color: string;
    skillIds: string[];
    description: string;
  }) => (
    <Card className="bg-secondary/50 border-accent-glow card-tech">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: color }}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">{level}</h3>
            <p className="text-xs text-muted-foreground font-mono">{skillIds.length} skills</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <div className="flex flex-wrap gap-2">
          {skillIds.map(id => {
            const skill = getSkillById(id);
            return skill ? (
              <Badge 
                key={id} 
                variant="secondary" 
                className="bg-secondary/50 text-muted-foreground text-xs font-mono"
              >
                {skill.name}
              </Badge>
            ) : null;
          })}
        </div>
      </CardContent>
    </Card>
  );

  const InstallStep = ({ 
    step, 
    title, 
    description, 
    code 
  }: { 
    step: number;
    title: string;
    description: string;
    code: string;
  }) => (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-mono font-bold">
        {step}
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-medium text-foreground mb-1">{title}</h4>
        <p className="text-xs text-muted-foreground mb-2">{description}</p>
        <div className="relative">
          <pre className="bg-secondary rounded p-3 text-xs font-mono text-accent overflow-x-auto border border-accent-glow">
            <code>{code}</code>
          </pre>
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-1 right-1 h-7 w-7 text-muted-foreground hover:text-accent"
            onClick={() => handleCopy(code, `step-${step}`)}
          >
            {copiedIndex === `step-${step}` ? (
              <CheckCircle className="w-3.5 h-3.5 text-accent" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen pt-14">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 circuit-grid-dots" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-circuit-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-circuit-pulse" style={{ animationDelay: '1.5s' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-accent-glow mb-6">
            <Cpu className="w-4 h-4 text-accent" />
            <span className="text-sm font-mono text-accent">Agent Training Ground</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="text-gradient-cyan text-glow">Claw Dojo</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-2">Agent Training Arena</p>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-8">
            Every Open Cloud agent starts here. Learn, practice, and master Skills 
            to become a powerful AI assistant. Follow the path from beginner to expert.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-mono text-sm btn-glow"
              asChild
            >
              <a href="#training-paths">
                Start Training
                <ArrowRight className="ml-2 w-4 h-4" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-accent-glow text-accent hover:text-accent hover:bg-accent/10 font-mono text-sm glow-border-cyan"
              asChild
            >
              <a href="#quick-start">
                Quick Install
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Training Paths Section */}
      <section id="training-paths" className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-accent" />
              <span className="text-xs font-mono text-accent">Training Paths</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Master Skills Step by Step
            </h2>
            <p className="text-sm text-muted-foreground font-mono">
              Progress from beginner to expert in your AI journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <SkillLevelCard
              level="Beginner"
              icon={BookOpen}
              color="#10b981"
              skillIds={beginnerSkills}
              description="Start here! Learn the fundamentals of agent capabilities. Essential skills every agent needs."
            />
            <SkillLevelCard
              level="Intermediate"
              icon={Zap}
              color="#f59e0b"
              skillIds={intermediateSkills}
              description="Build workflows and automate tasks. Connect your agent to real-world services."
            />
            <SkillLevelCard
              level="Advanced"
              icon={Rocket}
              color="#ef4444"
              skillIds={advancedSkills}
              description="Expert-level skills for maximum productivity. Become a powerful AI assistant."
            />
          </div>
        </div>
      </section>

      {/* Manual Install Guide */}
      <section className="py-16 bg-secondary/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Terminal className="w-4 h-4 text-accent" />
              <span className="text-xs font-mono text-accent">Manual Installation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Learn Step by Step
            </h2>
            <p className="text-sm text-muted-foreground font-mono">
              Install skills one by one to understand how they work
            </p>
          </div>

          <div className="space-y-6">
            <InstallStep
              step={1}
              title="Install ClawdHub CLI"
              description="First, install the ClawdHub command-line tool globally"
              code="npm install -g clawdhub"
            />
            <InstallStep
              step={2}
              title="Search for Skills"
              description="Find the skill you want to install"
              code="clawdhub search <skill-name>"
            />
            <InstallStep
              step={3}
              title="Install a Skill"
              description="Install any skill to your agent"
              code="npx clawdhub@latest install <skill-slug>"
            />
            <InstallStep
              step={4}
              title="Verify Installation"
              description="Check that the skill is installed correctly"
              code="clawdhub list"
            />
          </div>
        </div>
      </section>

      {/* Quick Install Section */}
      <section id="quick-start" className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-xs font-mono text-accent">Quick Start</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              One-Click Installation
            </h2>
            <p className="text-sm text-muted-foreground font-mono">
              Install all recommended skills at once
            </p>
          </div>

          <Card className="bg-secondary/50 border-accent-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Recommended Skills Pack</h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    {allRecommendedSkills.length} skills • Beginner to Advanced
                  </p>
                </div>
                <Badge className="bg-accent text-accent-foreground font-mono">
                  {beginnerSkills.length + intermediateSkills.length + advancedSkills.length} Skills
                </Badge>
              </div>

              <div className="bg-background rounded-lg p-4 border border-accent-glow mb-4">
                <code className="text-sm text-accent font-mono break-all">
                  npx clawdhub@latest install {allRecommendedSkills.join(" ")}
                </code>
              </div>

              <Button
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-mono"
                onClick={handleCopyAll}
              >
                {installAllCopied ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Copied! Ready to Install
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Install Command
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-secondary/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-muted-foreground mb-6">
            Every expert agent started here. Start your training now!
          </p>
          <Button
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-mono text-sm btn-glow"
            asChild
          >
            <a href="#training-paths">
              Start Training Now
              <ArrowRight className="ml-2 w-4 h-4" />
            </a>
          </Button>
        </div>
      </section>
    </main>
  );
}
