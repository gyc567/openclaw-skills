"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { skills } from "@/lib/skills-data";

interface SkillPackCardProps {
  name: string;
  description: string;
  skillIds: string[];
  icon: React.ElementType;
  color: string;
}

export function SkillPackCard({
  name,
  description,
  skillIds,
  icon: Icon,
  color,
}: SkillPackCardProps) {
  const getSkillById = (id: string) => skills.find((s) => s.id === id);

  return (
    <Card className="bg-secondary/50 border-accent-glow card-tech">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: color }}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">{name}</h3>
            <p className="text-xs text-muted-foreground font-mono">
              {skillIds.length} skills
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <div className="flex flex-wrap gap-2">
          {skillIds.map((id) => {
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
}
