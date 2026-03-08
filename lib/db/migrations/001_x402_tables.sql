-- x402 Payment Integration - Database Migrations
-- Run these in order

-- Migration 001: Create listings table (replaces static skills data)
CREATE TABLE IF NOT EXISTS listings (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES agents(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL DEFAULT 'skill' CHECK (type IN ('skill', 'persona', 'template')),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  price_usd DECIMAL(10,4) NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  package_url TEXT,
  x402_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_listings_agent_id ON listings(agent_id);
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_is_published ON listings(is_published);

-- Migration 002: Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES agents(id) ON DELETE CASCADE UNIQUE,
  address VARCHAR(42) NOT NULL,
  chain VARCHAR(20) NOT NULL DEFAULT 'base',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wallets_address ON wallets(address);
CREATE INDEX idx_wallets_agent_id ON wallets(agent_id);

-- Migration 003: Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER REFERENCES listings(id) ON DELETE SET NULL,
  buyer_wallet VARCHAR(42) NOT NULL,
  seller_agent_id INTEGER REFERENCES agents(id) ON DELETE SET NULL,
  amount_usd DECIMAL(10,4) NOT NULL,
  amount_raw VARCHAR(50),
  tx_hash VARCHAR(66),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'settled', 'failed')),
  facilitator VARCHAR(255),
  platform_fee DECIMAL(10,4) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  settled_at TIMESTAMP
);

CREATE INDEX idx_transactions_listing_id ON transactions(listing_id);
CREATE INDEX idx_transactions_buyer_wallet ON transactions(buyer_wallet);
CREATE INDEX idx_transactions_seller_agent_id ON transactions(seller_agent_id);
CREATE INDEX idx_transactions_status ON transactions(status);

-- Migration 004: Create x402_sessions table
CREATE TABLE IF NOT EXISTS x402_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(64) UNIQUE NOT NULL,
  listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
  buyer_wallet VARCHAR(42) NOT NULL,
  amount_usd DECIMAL(10,4) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_x402_sessions_session_id ON x402_sessions(session_id);
CREATE INDEX idx_x402_sessions_listing_id ON x402_sessions(listing_id);
CREATE INDEX idx_x402_sessions_buyer_wallet ON x402_sessions(buyer_wallet);
CREATE INDEX idx_x402_sessions_expires_at ON x402_sessions(expires_at);

-- Migration 005: Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  buyer_wallet VARCHAR(42) NOT NULL,
  transaction_id INTEGER REFERENCES transactions(id) ON DELETE SET NULL,
  amount_usd DECIMAL(10,4) NOT NULL,
  purchased_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_purchases_listing_id ON purchases(listing_id);
CREATE INDEX idx_purchases_buyer_id ON purchases(buyer_id);
CREATE INDEX idx_purchases_buyer_wallet ON purchases(buyer_wallet);

-- Migration 006: Create refunds table (7-day refund window)
CREATE TABLE IF NOT EXISTS refunds (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER REFERENCES transactions(id) ON DELETE CASCADE,
  buyer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  amount_usd DECIMAL(10,4) NOT NULL,
  reason TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed')),
  requested_at TIMESTAMP NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refunds_transaction_id ON refunds(transaction_id);
CREATE INDEX idx_refunds_buyer_id ON refunds(buyer_id);
CREATE INDEX idx_refunds_status ON refunds(status);

-- Migration 007: Create payouts table (minimum $50 withdrawal)
CREATE TABLE IF NOT EXISTS payouts (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES agents(id) ON DELETE CASCADE,
  amount_usd DECIMAL(10,4) NOT NULL,
  fee_usd DECIMAL(10,4) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  wallet_address VARCHAR(42) NOT NULL,
  tx_hash VARCHAR(66),
  requested_at TIMESTAMP NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payouts_agent_id ON payouts(agent_id);
CREATE INDEX idx_payouts_status ON payouts(status);

-- Add new columns to existing skills table (if not exists)
ALTER TABLE skills ADD COLUMN IF NOT EXISTS price_usd DECIMAL(10,4) DEFAULT 0;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(42);
ALTER TABLE skills ADD COLUMN IF NOT EXISTS x402_enabled BOOLEAN DEFAULT false;
