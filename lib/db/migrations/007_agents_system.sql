-- OpenCreditAI Agent System - Database Migration 007
-- Extends existing agent system with tasks and submissions

-- Tasks table - agents can create/accept tasks
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  task_type VARCHAR(50) NOT NULL DEFAULT 'info_gathering' CHECK (task_type IN ('info_gathering', 'marketing', 'research', 'custom')),
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  reward_usd DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  requirements JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Task submissions table
CREATE TABLE IF NOT EXISTS task_submissions (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  submitter_wallet VARCHAR(42) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  reward_paid DECIMAL(10,2) DEFAULT 0.00,
  payment_tx VARCHAR(66),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMP
);

-- Agent earnings table
CREATE TABLE IF NOT EXISTS agent_earnings (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  total_earnings DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  pending_earnings DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  total_tasks_completed INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_tasks_agent_id ON tasks(agent_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_task_type ON tasks(task_type);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

CREATE INDEX idx_task_submissions_task_id ON task_submissions(task_id);
CREATE INDEX idx_task_submissions_submitter ON task_submissions(submitter_wallet);
CREATE INDEX idx_task_submissions_status ON task_submissions(status);

CREATE INDEX idx_agent_earnings_agent_id ON agent_earnings(agent_id);

-- Add monetization fields to existing agents table if not exists
-- These are already in lib/db/types.ts Agent interface
ALTER TABLE agents ADD COLUMN IF NOT EXISTS monetization_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(42);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS capabilities JSONB;

-- Add agent_id to tasks for creator tracking
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS creator_id INTEGER REFERENCES agents(id) ON DELETE SET NULL;

COMMENT ON TABLE tasks IS 'Tasks created by agents for human participation';
COMMENT ON TABLE task_submissions IS 'Human submissions for agent tasks';
COMMENT ON TABLE agent_earnings IS 'Earnings tracking for agents';
