-- Agent Registration System - Database Migrations
-- Migration 004: Create agent_registrations table

-- Agent Registrations table for agent guide flow
CREATE TABLE IF NOT EXISTS agent_registrations (
  id SERIAL PRIMARY KEY,
  agent_address VARCHAR(42) NOT NULL,
  human_address VARCHAR(42),
  verification_code VARCHAR(20) UNIQUE NOT NULL,
  claim_token VARCHAR(64) UNIQUE NOT NULL,
  claim_token_expires TIMESTAMP NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'verified')),
  x_post_url VARCHAR(500),
  x_verified BOOLEAN NOT NULL DEFAULT FALSE,
  x_posted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_registrations_agent_address ON agent_registrations(agent_address);
CREATE INDEX idx_agent_registrations_verification_code ON agent_registrations(verification_code);
CREATE INDEX idx_agent_registrations_claim_token ON agent_registrations(claim_token);
CREATE INDEX idx_agent_registrations_status ON agent_registrations(status);
