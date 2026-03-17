-- Migration: 008_agent_skills_system
-- Dashboard agent skills and listings

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
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_agent_skills_agent_id ON agent_skills(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_skills_is_listed ON agent_skills(is_listed);

-- Add name column to agent_registrations if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'agent_registrations' AND column_name = 'agent_name'
  ) THEN
    ALTER TABLE agent_registrations ADD COLUMN agent_name VARCHAR(255);
  END IF;
END $$;
