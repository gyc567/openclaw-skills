import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/client";

/**
 * POST /api/admin/migrate - Run database migrations
 * WARNING: This endpoint should be protected in production
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const migrationName = body.migration;

    if (!migrationName) {
      return NextResponse.json(
        { error: "Migration name required" },
        { status: 400 }
      );
    }

    // Migration: Add category column to creators table
    if (migrationName === "005_add_creators_category") {
      await query(`
        ALTER TABLE creators ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general'
      `);
      await query(`
        CREATE INDEX IF NOT EXISTS idx_creators_category ON creators(category)
      `);
      await query(`
        CREATE INDEX IF NOT EXISTS idx_creators_is_verified_category ON creators(is_verified, category)
      `);
      
      return NextResponse.json({
        success: true,
        message: "Migration 005_add_creators_category applied"
      });
    }

    // Migration: Add rating column to creators table
    if (migrationName === "008_add_creators_rating") {
      await query(`
        ALTER TABLE creators ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0
      `);
      
      return NextResponse.json({
        success: true,
        message: "Migration 008_add_creators_rating applied"
      });
    }

    // Migration: Create agent system tables
    if (migrationName === "007_agents_system") {
      await query(`
        CREATE TABLE IF NOT EXISTS tasks (
          id SERIAL PRIMARY KEY,
          agent_id INTEGER REFERENCES agents(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          task_type VARCHAR(50) DEFAULT 'info_gathering',
          status VARCHAR(20) DEFAULT 'open',
          reward_usd DECIMAL(10,2) DEFAULT 0.00,
          requirements JSONB,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          completed_at TIMESTAMP
        )
      `);
      
      await query(`
        CREATE TABLE IF NOT EXISTS task_submissions (
          id SERIAL PRIMARY KEY,
          task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
          submitter_wallet VARCHAR(42) NOT NULL,
          content TEXT NOT NULL,
          status VARCHAR(20) DEFAULT 'pending',
          reward_paid DECIMAL(10,2) DEFAULT 0.00,
          payment_tx VARCHAR(66),
          created_at TIMESTAMP DEFAULT NOW(),
          reviewed_at TIMESTAMP
        )
      `);
      
      await query(`
        CREATE TABLE IF NOT EXISTS agent_earnings (
          id SERIAL PRIMARY KEY,
          agent_id INTEGER REFERENCES agents(id) ON DELETE CASCADE,
          total_earnings DECIMAL(18,2) DEFAULT 0.00,
          pending_earnings DECIMAL(18,2) DEFAULT 0.00,
          total_tasks_completed INTEGER DEFAULT 0,
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      await query(`ALTER TABLE agents ADD COLUMN IF NOT EXISTS monetization_enabled BOOLEAN DEFAULT FALSE`);
      await query(`ALTER TABLE agents ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(42)`);
      await query(`ALTER TABLE agents ADD COLUMN IF NOT EXISTS capabilities JSONB`);
      
      return NextResponse.json({
        success: true,
        message: "Migration 007_agents_system applied"
      });
    }

    // Migration: Create agent_skills table for dashboard
    if (migrationName === "008_agent_skills_system") {
      await query(`
        CREATE TABLE IF NOT EXISTS agent_skills (
          id SERIAL PRIMARY KEY,
          agent_id INTEGER REFERENCES agent_registrations(id) ON DELETE CASCADE,
          skill_name VARCHAR(255) NOT NULL,
          skill_description TEXT,
          skill_category VARCHAR(100),
          skill_tags TEXT[],
          listed_price DECIMAL(10,2),
          is_listed BOOLEAN DEFAULT FALSE,
          sales_count INTEGER DEFAULT 0,
          earnings DECIMAL(18,8) DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      await query(`CREATE INDEX IF NOT EXISTS idx_agent_skills_agent_id ON agent_skills(agent_id)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_agent_skills_is_listed ON agent_skills(is_listed)`);

      await query(`
        ALTER TABLE agent_registrations ADD COLUMN IF NOT EXISTS agent_name VARCHAR(255)
      `);
      
      return NextResponse.json({
        success: true,
        message: "Migration 008_agent_skills_system applied"
      });
    }

    return NextResponse.json(
      { error: "Unknown migration" },
      { status: 404 }
    );
  } catch (error) {
    console.error("[Migration] Error:", error);
    return NextResponse.json(
      { error: "Migration failed" },
      { status: 500 }
    );
  }
}
