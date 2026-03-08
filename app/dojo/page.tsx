"use client";

import { Button } from "@/components/ui/button";
import { BookOpen, Zap, Rocket, Cpu, Layers, Sparkles, ArrowRight } from "lucide-react";
import { SkillPackCard } from "@/components/dojo/skill-pack-card";
import { InstallCommand } from "@/components/dojo/install-command";

const essentialSkills = [
  "github",
  "github-pr",
  "read-github",
  "claude-team",
  "cursor-agent",
];

const advancedSkills = [
  "discord",
  "slack",
  "cloudflare",
  "kubectl-skill",
  "supabase",
  "vercel-react-best-practices",
  "frontend-design",
  "openai",
];

const expertSkills = [
  "conventional-commits",
  "codex-monitor",
  "agentlens",
  "digital-ocean",
  "hetzner-cloud",
  "opencode-acp-control",
  "ui-audit",
];

const allSkills = [...essentialSkills, ...advancedSkills, ...expertSkills];

export default function ClawDojoPage() {
  return (
    <main className="min-h-screen pt-14">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 circuit-grid-dots" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-circuit-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-circuit-pulse"
          style={{ animationDelay: "1.5s" }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-accent-glow mb-6">
            <Cpu className="w-4 h-4 text-accent" />
            <span className="text-sm font-mono text-accent">
              Agent Training Ground
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="text-gradient-cyan text-glow">Claw Dojo</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Agent Training Arena
          </p>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-8">
            One-click install all essential skills. Transform your OpenClaw
            agent into a powerful AI assistant.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-mono text-sm btn-glow"
              asChild
            >
              <a href="#skill-packs">
                View Skill Packs
                <ArrowRight className="ml-2 w-4 h-4" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-accent-glow text-accent hover:text-accent hover:bg-accent/10 font-mono text-sm glow-border-cyan"
              asChild
            >
              <a href="#quick-install">Quick Install</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Skill Packs Section */}
      <section id="skill-packs" className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-accent" />
              <span className="text-xs font-mono text-accent">
                Skill Packages
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Choose Your Path
            </h2>
            <p className="text-sm text-muted-foreground font-mono">
              Select a skill pack based on your needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <SkillPackCard
              name="Essential Pack"
              description="Must-have skills for every new OpenClaw agent. Start here!"
              skillIds={essentialSkills}
              icon={BookOpen}
              color="#10b981"
            />
            <SkillPackCard
              name="Advanced Pack"
              description="Build workflows and connect to real-world services."
              skillIds={advancedSkills}
              icon={Zap}
              color="#f59e0b"
            />
            <SkillPackCard
              name="Expert Pack"
              description="Expert-level skills for maximum productivity."
              skillIds={expertSkills}
              icon={Rocket}
              color="#ef4444"
            />
          </div>
        </div>
      </section>

      {/* Quick Install Section */}
      <section id="quick-install" className="py-16 bg-secondary/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-xs font-mono text-accent">
                One-Click Install
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Install All Skills
            </h2>
            <p className="text-sm text-muted-foreground font-mono">
              Copy and run the command below to install all skills at once
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <InstallCommand packName="Essential Pack" skillIds={essentialSkills} />
            <InstallCommand
              packName="All Skills Pack"
              skillIds={allSkills}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-secondary/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Ready to Level Up?
          </h2>
          <p className="text-muted-foreground mb-6">
            Install the essential pack and transform your agent today!
          </p>
          <Button
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-mono text-sm btn-glow"
            asChild
          >
            <a href="#quick-install">
              Install Now
              <ArrowRight className="ml-2 w-4 h-4" />
            </a>
          </Button>
        </div>
      </section>
    </main>
  );
}
