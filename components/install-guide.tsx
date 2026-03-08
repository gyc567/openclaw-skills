"use client";

import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Terminal, Folder, Package, Download } from "lucide-react";
import { useState } from "react";
import { en } from "@/lib/i18n";

const t = en.installGuide;

const installMethods = [
  {
    id: "cli" as const,
    icon: Terminal,
    ...t.methods.cli,
  },
  {
    id: "manual" as const,
    icon: Folder,
    ...t.methods.manual,
  },
];

export function InstallGuide() {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const handleCopy = (text: string, index: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <section id="install" className="py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <Badge
            variant="secondary"
            className="mb-3 bg-secondary/80 text-muted-foreground border-accent-glow font-mono text-xs"
          >
            <Download className="w-3 h-3 mr-1.5" />
            {t.badge}
          </Badge>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            {t.title}
          </h2>
          <p className="text-sm text-muted-foreground font-mono">
            {t.subtitle}
          </p>
        </div>

        <Tabs defaultValue="cli" className="w-full">
          <TabsList className="w-full max-w-sm mx-auto mb-6 bg-secondary border border-accent-glow p-1">
            {installMethods.map((method) => (
              <TabsTrigger
                key={method.id}
                value={method.id}
                className="flex-1 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground font-mono text-xs"
              >
                <method.icon className="w-3.5 h-3.5 mr-1.5" />
                {method.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {installMethods.map((method) => (
            <TabsContent key={method.id} value={method.id}>
              <div className="grid md:grid-cols-3 gap-4">
                {method.steps.map((step, index) => (
                  <Card key={step.title} className="bg-card border-accent-glow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded bg-secondary flex items-center justify-center text-xs font-mono">
                          {index + 1}
                        </div>
                        <h3 className="text-sm font-medium text-foreground">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3 font-mono">
                        {step.description}
                      </p>
                      <div className="relative">
                        <pre className="bg-secondary rounded p-2 text-xs font-mono text-muted-foreground overflow-x-auto border border-accent-glow">
                          <code>{step.code}</code>
                        </pre>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-1 right-1 h-7 w-7 text-muted-foreground hover:text-accent"
                          onClick={() => handleCopy(step.code, `${method.id}-${index}`)}
                        >
                          {copiedIndex === `${method.id}-${index}` ? (
                            <Check className="w-3.5 h-3.5 text-accent" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <Card className="bg-card border-accent-glow mt-10">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-medium text-foreground font-mono">
                {t.priority.title}
              </h3>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {t.priority.levels.map((info, index) => (
                <div
                  key={info.label}
                  className="p-3 rounded bg-secondary border border-accent-glow"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded bg-background flex items-center justify-center text-xs font-mono border border-accent-glow">
                      {index + 1}
                    </div>
                    <div className="font-medium text-foreground text-sm">
                      {info.label}
                    </div>
                  </div>
                  <code className="text-xs text-muted-foreground font-mono block mb-1">
                    {info.path}
                  </code>
                  <div className="text-xs text-muted-foreground font-mono">
                    {info.desc}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
