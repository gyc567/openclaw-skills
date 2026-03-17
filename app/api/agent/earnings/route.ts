import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/client";
import { withRateLimit } from "@/lib/api/rate-limit";

export async function GET(req: NextRequest) {
  const rateLimitError = withRateLimit(req, { limit: 30, windowMs: 60 * 1000 });
  if (rateLimitError) return rateLimitError;

  try {
    const { searchParams } = new URL(req.url);
    const agent_id = searchParams.get("id");

    if (!agent_id) {
      return NextResponse.json(
        { success: false, error: "Agent ID is required" },
        { status: 400 }
      );
    }

    const earningsResult = await query(
      "SELECT * FROM agent_earnings WHERE agent_id = $1",
      [parseInt(agent_id)]
    );

    if (earningsResult.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          total_earnings: "0.00",
          pending_earnings: "0.00",
          total_tasks_completed: 0,
          recent_transactions: [],
        },
      });
    }

    const earnings = earningsResult[0];

    const transactionsResult = await query(
      `SELECT id, 'task_reward' as type, reward_paid as amount, 'Task completion' as description, created_at
       FROM task_submissions 
       WHERE task_id IN (SELECT id FROM tasks WHERE agent_id = $1) AND status = 'paid'
       ORDER BY created_at DESC LIMIT 10`,
      [parseInt(agent_id)]
    );

    return NextResponse.json({
      success: true,
      data: {
        total_earnings: earnings.total_earnings,
        pending_earnings: earnings.pending_earnings,
        total_tasks_completed: earnings.total_tasks_completed,
        recent_transactions: transactionsResult,
      },
    });
  } catch (error) {
    console.error("[Agent Earnings API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get earnings" },
      { status: 500 }
    );
  }
}
