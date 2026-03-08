"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skill, categories } from "@/lib/skills-data";
import { Download, ExternalLink, Copy, Check, Tag, User, ArrowUpRight, Code, Zap, FileCode, CheckCircle, XCircle } from "lucide-react";
import { en } from "@/lib/i18n";
import { ErrorBoundary } from "./error/error-boundary";

const t = en.skillCard;

interface SkillCardProps {
  skill: Skill;
  index?: number;
}

export function SkillCard({ skill }: SkillCardProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const category = categories.find((c) => c.id === skill.category);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(`npx clawdhub@latest install ${skill.id}`)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
      });
  }, [skill.id]);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  const cardContent = (
    <Card className="bg-card border-accent-glow hover:border-accent-glow card-tech transition-colors cursor-pointer h-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded flex items-center justify-center text-sm font-mono"
              style={{ backgroundColor: category?.color || "#333" }}
            >
              {skill.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground flex items-center gap-1">
                {skill.name}
                <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
              </h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                <User className="w-3 h-3" />
                {skill.author}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {skill.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {skill.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-secondary/50 text-muted-foreground text-xs font-mono"
              >
                {t.tagPrefix}{tag}
              </Badge>
            ))}
            {skill.tags.length > 2 && (
              <Badge
                variant="secondary"
                className="bg-secondary/50 text-muted-foreground text-xs font-mono"
              >
                {t.moreTags(skill.tags.length - 2)}
              </Badge>
            )}
          </div>
          {skill.installs && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
              <Download className="w-3 h-3" />
              {skill.installs}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            {cardContent}
          </DialogTrigger>

          <DialogContent className="bg-card border-accent-glow text-foreground max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded flex items-center justify-center text-sm font-mono"
                  style={{ backgroundColor: category?.color || "#333" }}
                >
                  {skill.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <DialogTitle className="text-base font-medium">
                    {skill.name}
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground flex items-center gap-1 text-xs font-mono mt-0.5">
                    <User className="w-3 h-3" />
                    {t.by} {skill.author}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {skill.description}
              </p>

              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1 font-mono">
                  <Tag className="w-3 h-3" />
                  Tags
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {skill.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-secondary/50 text-muted-foreground text-xs font-mono"
                    >
                      {t.tagPrefix}{tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* API Commands Section */}
              {skill.api && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1 font-mono">
                    <Code className="w-3 h-3" />
                    {t.apiCommands}
                  </h4>
                  <div className="bg-secondary rounded-lg border border-accent-glow overflow-hidden">
                    <div className="max-h-40 overflow-y-auto">
                      {skill.api.commands.map((cmd, idx) => (
                        <div key={idx} className="px-3 py-2 border-b border-accent-glow last:border-b-0">
                          <code className="text-xs text-accent font-mono block">
                            {cmd.name}{cmd.parameters || '()'}
                          </code>
                          <span className="text-xs text-muted-foreground">
                            {cmd.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Capabilities Section */}
              {skill.capabilities && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1 font-mono">
                    <Zap className="w-3 h-3" />
                    {t.capabilities}
                  </h4>
                  <div className="space-y-2">
                    {skill.capabilities.supported.length > 0 && (
                      <div className="bg-secondary rounded-lg p-2 border border-accent-glow">
                        <div className="flex flex-wrap gap-1.5">
                          {skill.capabilities.supported.map((cap, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="bg-green-500/10 text-green-400 text-xs font-mono"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {cap}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {skill.capabilities.unsupported.length > 0 && (
                      <div className="bg-secondary rounded-lg p-2 border border-accent-glow opacity-70">
                        <div className="flex flex-wrap gap-1.5">
                          {skill.capabilities.unsupported.map((cap, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="bg-red-500/10 text-red-400 text-xs font-mono"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              {cap}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Usage Section */}
              {skill.usage && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1 font-mono">
                    <FileCode className="w-3 h-3" />
                    {t.usageExample}
                  </h4>
                  <pre className="bg-background rounded-lg p-3 border border-accent-glow overflow-x-auto text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                    {skill.usage}
                  </pre>
                </div>
              )}

              <div className="bg-secondary rounded-lg p-3 space-y-2 border border-accent-glow">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-mono">
                    {t.installCommand}
                  </span>
                  {skill.installs && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                      <Download className="w-3 h-3" />
                      {t.installCount(skill.installs)}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <code className="flex-1 bg-background rounded px-2 py-1.5 text-xs text-muted-foreground font-mono border border-accent-glow">
                    npx clawdhub@latest install {skill.id}
                  </code>
                  <Button
                    size="icon"
                    variant="outline"
                    className="border-accent-glow hover:bg-accent/10 hover:text-accent"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-accent" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 font-mono text-xs"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1.5" />
                      {t.copied}
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1.5" />
                      {t.copyCommand}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="border-accent-glow hover:bg-accent/10 hover:text-accent"
                  asChild
                >
                  <a
                    href="https://github.com/VoltAgent/awesome-openclaw-skills"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </ErrorBoundary>
  );
}
