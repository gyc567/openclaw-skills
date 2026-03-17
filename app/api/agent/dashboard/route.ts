import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/client";
import { withRateLimit } from "@/lib/api/rate-limit";

export async function GET(req: NextRequest) {
  const rateLimitError = withRateLimit(req, { limit: 30, windowMs: 60 * 1000 });
  if (rateLimitError) return rateLimitError;

  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId");

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: "agentId is required" },
        { status: 400 }
      );
    }

    const agentResult = await query(
      "SELECT id, agent_address, agent_name, verification_code, status, x_verified, created_at FROM agent_registrations WHERE id = $1",
      [agentId]
    );

    if (agentResult.length === 0) {
      return NextResponse.json(
        { success: false, error: "Agent not found" },
        { status: 404 }
      );
    }

    const agent = agentResult[0];

    const skillsResult = await query<{
      id: number;
      skill_name: string;
      skill_description: string | null;
      skill_category: string | null;
      listed_price: string | null;
      is_listed: boolean;
      sales_count: number;
      earnings: string;
      created_at: Date;
    }>(
      `SELECT id, skill_name, skill_description, skill_category, listed_price, is_listed, sales_count, earnings, created_at
       FROM agent_skills WHERE agent_id = $1 ORDER BY created_at DESC`,
      [agentId]
    );

    const mySkills = skillsResult.filter((s) => !s.is_listed);
    const listedSkills = skillsResult.filter((s) => s.is_listed);

    const totalEarnings = skillsResult.reduce(
      (sum, s) => sum + parseFloat(s.earnings || "0"),
      0
    );
    const totalSales = skillsResult.reduce(
      (sum, s) => sum + (s.sales_count || 0),
      0
    );

    const progress = calculateProgress(mySkills.length, listedSkills.length, totalSales);

    return NextResponse.json({
      success: true,
      data: {
        agent: {
          id: agent.id,
          name: agent.agent_name || `Agent ${agent.verification_code}`,
          address: agent.agent_address,
          verificationCode: agent.verification_code,
          status: agent.status,
          isVerified: agent.x_verified,
          createdAt: agent.created_at,
        },
        stats: {
          skillsCount: mySkills.length,
          listedCount: listedSkills.length,
          totalEarnings,
          totalSales,
        },
        mySkills,
        listedSkills,
        progress,
      },
    });
  } catch (error) {
    console.error("[Agent Dashboard API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard" },
      { status: 500 }
    );
  }
}

function calculateProgress(skillsCount: number, listedCount: number, salesCount: number): {
  level: number;
  levelName: string;
  percentage: number;
  steps: { id: string; label: string; completed: boolean }[];
} {
  const steps = [
    { id: "learn_skill", label: "Learn your first skill", completed: skillsCount > 0 },
    { id: "list_skill", label: "List a skill for sale", completed: listedCount > 0 },
    { id: "make_sale", label: "Make your first sale", completed: salesCount > 0 },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const percentage = Math.round((completedCount / 3) * 100);

  let level = 1;
  let levelName = "Newborn";

  if (completedCount >= 1 && completedCount < 2) {
    level = 2;
    levelName = "Apprentice";
  } else if (completedCount >= 2 && completedCount < 3) {
    level = 3;
    levelName = "Skilled";
  } else if (completedCount >= 3) {
    level = 4;
    levelName = "Master";
  }

  return { level, levelName, percentage, steps };
}

export async function POST(req: NextRequest) {
  const rateLimitError = withRateLimit(req, { limit: 10, windowMs: 60 * 1000 });
  if (rateLimitError) return rateLimitError;

  try {
    const body = await req.json();
    const { action, agentId, data } = body;

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: "agentId is required" },
        { status: 400 }
      );
    }

    switch (action) {
      case "updateName": {
        const { name } = data;
        if (!name || name.trim().length === 0) {
          return NextResponse.json(
            { success: false, error: "Name is required" },
            { status: 400 }
          );
        }

        await query(
          "UPDATE agent_registrations SET agent_name = $1, updated_at = NOW() WHERE id = $2",
          [name.trim(), agentId]
        );

        return NextResponse.json({
          success: true,
          message: "Agent name updated",
        });
      }

      case "addSkill": {
        const { skillName, skillDescription, skillCategory, skillTags } = data;

        if (!skillName) {
          return NextResponse.json(
            { success: false, error: "skillName is required" },
            { status: 400 }
          );
        }

        const result = await query(
          `INSERT INTO agent_skills (agent_id, skill_name, skill_description, skill_category, skill_tags, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
           RETURNING *`,
          [agentId, skillName, skillDescription || null, skillCategory || null, skillTags || null]
        );

        return NextResponse.json({
          success: true,
          data: result[0],
          message: "Skill added successfully",
        });
      }

      case "listSkill": {
        const { skillId, price } = data;

        if (!skillId || !price) {
          return NextResponse.json(
            { success: false, error: "skillId and price are required" },
            { status: 400 }
          );
        }

        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum <= 0) {
          return NextResponse.json(
            { success: false, error: "Invalid price" },
            { status: 400 }
          );
        }

        await query(
          `UPDATE agent_skills 
           SET is_listed = true, listed_price = $1, updated_at = NOW() 
           WHERE id = $2 AND agent_id = $3`,
          [priceNum, skillId, agentId]
        );

        return NextResponse.json({
          success: true,
          message: "Skill listed for sale",
        });
      }

      case "unlistSkill": {
        const { skillId } = data;

        if (!skillId) {
          return NextResponse.json(
            { success: false, error: "skillId is required" },
            { status: 400 }
          );
        }

        await query(
          `UPDATE agent_skills 
           SET is_listed = false, listed_price = NULL, updated_at = NOW() 
           WHERE id = $1 AND agent_id = $2`,
          [skillId, agentId]
        );

        return NextResponse.json({
          success: true,
          message: "Skill unlisted",
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[Agent Dashboard API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}
