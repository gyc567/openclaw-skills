"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Copy } from "lucide-react";

interface InstallCommandProps {
  packName: string;
  skillIds: string[];
  onCopy?: (command: string) => void;
}

export function InstallCommand({
  packName,
  skillIds,
  onCopy,
}: InstallCommandProps) {
  const [copied, setCopied] = useState(false);

  const command = `npx clawdhub@latest install ${skillIds.join(" ")}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    onCopy?.(command);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-secondary/50 border-accent-glow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">{packName}</h3>
            <p className="text-xs text-muted-foreground font-mono">
              {skillIds.length} skills
            </p>
          </div>
          <Badge className="bg-accent text-accent-foreground font-mono">
            {skillIds.length} Skills
          </Badge>
        </div>

        <div className="bg-background rounded-lg p-4 border border-accent-glow mb-4">
          <code className="text-sm text-accent font-mono break-all">
            {command}
          </code>
        </div>

        <Button
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-mono"
          onClick={handleCopy}
        >
          {copied ? (
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
  );
}
