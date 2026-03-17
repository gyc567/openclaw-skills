# OpenCreditAI Agent System - Phase 1 Implementation Plan

## Overview

**Extend existing Agent Guide system** for OpenCreditAI AI Economy Platform.

**Goal:** Enable AI agents to register on platform, get claimed by humans via Twitter/X link, and unlock monetization features.

---

## TL;DR

> **Quick Summary**: Extend existing agent system - agents register → humans claim via wallet + Twitter link → unlock monetization
> 
> **Deliverables**:
> - Database migration (extend agents table + new tasks/submissions)
> - Agent Registration API (extend existing)
> - Claim Flow API (extend existing)
> - Claim UI Page
> - OpenCreditAI Skill file (GitHub-based)
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES
> **Critical Path**: Extend APIs → Skills → UI

---

## Context

### Clarified Decisions (from user)
1. **Extend existing** Agent Guide system (not new)
2. **Reuse existing** `agents` + `agent_registrations` tables
3. **Simplified verification** - user pastes X.com link (no Twitter OAuth API)
4. **Skills from GitHub** - openclaw/skills repo

### User Requirements
1. Platform generates Agent ID
2. Smart wallet support for signing
3. Human claim via X.com link verification
4. Skills sourced from GitHub (openclaw/skills)
5. Base USDC for payments
6. Initial tasks: information gathering + marketing (user-defined)

### Technical Decisions
- **Database**: Extend existing agents + new tasks/submissions tables
- **Auth**: Wallet signature + X.com link paste (simplified)
- **Skills Source**: GitHub API (openclaw/skills repo)
- **Payment**: x402 protocol with Base USDC

---

## Work Objectives

### Core Objective
Extend existing agent system + human claim flow for OpenCreditAI economy platform.

### Concrete Deliverables

| # | Deliverable | File |
|---|-------------|------|
| 1 | Database migration (tasks, submissions) | lib/db/migrations/007_agents_system.sql |
| 2 | TypeScript types (extend) | lib/types/agents.ts (NEW or extend lib/db/types.ts) |
| 3 | Agent client library | lib/agents/client.ts |
| 4 | Register API (extend) | app/api/agent/register/route.ts |
| 5 | Claim start API | app/api/agent/claim/start/route.ts |
| 6 | Claim complete API | app/api/agent/claim/complete/route.ts |
| 7 | Status API (extend) | app/api/agent/status/route.ts |
| 8 | Earnings API | app/api/agent/earnings/route.ts |
| 9 | Claim page UI | app/claim/[token]/page.tsx |
| 10 | Claim page components | app/claim/components/* |
| 11 | GitHub skills lib | lib/github/skills.ts |
| 12 | Skill file | skills/opencreditai/SKILL.md |
| 13 | Skill package.json | skills/opencreditai/package.json |
| 14 | Skill client lib | skills/opencreditai/lib/client.ts |

### Must Have
- Agent registration returns agent_id and claim_url (existing)
- Human can claim via wallet signature + X.com link paste
- Claimed agents have monetization_enabled = true
- Skill file enables agent to discover and install skills from GitHub

### Must NOT Have
- No Twitter OAuth API (use simplified link paste)
- No payment processing in Phase 1 (just the flow)
- No task marketplace in Phase 1 (Phase 2)

---

## Verification Strategy

**Zero Human Intervention** — ALL verification is agent-executed.

### QA Policy
Every task MUST include agent-executed QA scenarios:
- **API routes**: Use curl to test endpoints, assert status + response
- **UI pages**: Use Playwright to navigate, fill forms, assert DOM
- **DB**: Verify tables exist and data inserts correctly

---

## Execution Strategy

### Wave 1: Foundation (DB + Types + Libs)
```
├── Task 1: Database migration (tasks, task_submissions tables - extend existing)
├── Task 2: TypeScript types for agents system (extend existing)
├── Task 3: Agent client library
└── Task 4: GitHub skills utility (fetch from openclaw/skills)
```

### Wave 2: Core APIs (Extend Existing)
```
├── Task 5: POST /api/agent/register (extend existing)
├── Task 6: POST /api/agent/claim/start
├── Task 7: POST /api/agent/claim/complete (X.com link verification)
├── Task 8: GET /api/agent/status (extend existing)
└── Task 9: GET /api/agent/earnings
```

### Wave 3: UI + Integration
```
├── Task 10: Claim page UI (/claim/[token])
├── Task 11: Connect wallet component
├── Task 12: X.com link verification component
└── Task 13: Claim success state
```

### Wave 4: Skill File
```
├── Task 14: SKILL.md (main skill file)
├── Task 15: package.json
└── Task 16: lib/client.ts
```

---

## TODOs

### Wave 1: Foundation

- [ ] 1. Database Migration - tasks, task_submissions tables

  **What to do**:
  - Create lib/db/migrations/007_agents_system.sql
  - Extend/use existing: agents, agent_registrations tables
  - Add NEW tables: tasks, task_submissions
  - Add indexes for performance
  - Run migration against database

  **References**:
  - lib/db/migrations/004_agent_registrations.sql - existing pattern

  **QA Scenarios**:
  - Verify tables exist: psql -c "\dt" shows tasks, task_submissions

- [ ] 2. TypeScript Types for Agents System

  **What to do**:
  - Create lib/types/agents.ts (or extend lib/db/types.ts)
  - Include: AgentExtended, Task, TaskSubmission, ClaimStatus types
  - Match database schema

  **References**:
  - lib/db/types.ts - existing types pattern
  - lib/db/migrations/007_agents_system.sql - schema reference

- [ ] 3. Agent Client Library

  **What to do**:
  - Create lib/agents/client.ts
  - Functions: registerAgent, startClaim, completeClaim, getStatus, getEarnings
  - Use fetch with proper headers
  - Handle errors gracefully

  **References**:
  - lib/api/* - existing API client patterns

- [ ] 4. GitHub Skills Utility

  **What to do**:
  - Create lib/github/skills.ts
  - Functions: fetchSkillsFromRepo, getSkillByName, searchSkills
  - Use GitHub API (openclaw/skills repo)
  - Handle rate limiting

  **References**:
  - GitHub REST API docs

### Wave 2: Core APIs

- [ ] 5. POST /api/agent/register (Extend Existing)

  **What to do**:
  - Extend app/api/agent/register/route.ts
  - Input: name, description, capabilities, wallet_address
  - Output: agent_id, claim_url, verification_code, claim_token
  - Generate unique agent_id: oca_[random]
  - Create claim_token and verification_code
  - Save to agents table

  **QA Scenarios**:
  - curl -X POST /api/agent/register -d '{"name":"Test"}' → 200 + agent_id

- [ ] 6. POST /api/agent/claim/start

  **What to do**:
  - Create app/api/agent/claim/start/route.ts
  - Input: claim_token, human_wallet_address, signature
  - Verify signature (smart wallet)
  - Return success / next step
  - Update claim status

  **QA Scenarios**:
  - Valid claim → 200 + success
  - Invalid claim_token → 404

- [ ] 7. POST /api/agent/claim/complete (X.com Link Verification)

  **What to do**:
  - Create app/api/agent/claim/complete/route.ts
  - Input: claim_token, x_post_url
  - Validate X.com link format: `https://x.com/{username}/status/{id}`
  - Extract username from link
  - Update agent: x_handle, x_verified, monetization_enabled = true
  - Return success

  **QA Scenarios**:
  - Valid X.com link → agent claimed, monetization_enabled = true
  - Invalid link format → 400 error

- [ ] 8. GET /api/agent/status (Extend Existing)

  **What to do**:
  - Extend app/api/agent/status/route.ts
  - Input: verification_code or claim_token
  - Return: status, x_handle, x_verified, monetization_enabled

  **QA Scenarios**:
  - Pending claim → {status: "pending_claim"}
  - Claimed → {status: "claimed", x_handle: "@...", monetization_enabled: true}

- [ ] 9. GET /api/agent/earnings

  **What to do**:
  - Create app/api/agent/earnings/route.ts
  - Require authentication (wallet or token)
  - Return: total_earnings, pending_earnings, transactions[]

  **QA Scenarios**:
  - Authorized → earnings data
  - Unauthorized → 401

### Wave 3: UI

- [ ] 10. Claim Page - Main Layout

  **What to do**:
  - Create app/claim/[token]/page.tsx
  - Layout: Header, Agent info card, Claim steps, Footer
  - Steps: Connect Wallet → X.com Link → Complete

  **QA Scenarios**:
  - /claim/valid_token → page renders with agent info
  - /claim/invalid_token → error state

- [ ] 11. Connect Wallet Component

  **What to do**:
  - Create app/claim/components/connect-wallet.tsx
  - Support MetaMask + smart wallets
  - Sign message: "Claim agent [agent_id] for [wallet_address]"
  - On success → call claim/start API

  **QA Scenarios**:
  - Click connect → wallet opens
  - Sign message → signature returned

- [ ] 12. X.com Link Component

  **What to do**:
  - Create app/claim/components/x-link-verify.tsx
  - After wallet connected → show X.com link input
  - Validate link format
  - On valid → call claim/complete API

  **QA Scenarios**:
  - Valid link → success
  - Invalid format → error message

- [ ] 13. Claim Success State

  **What to do**:
  - Show success message after claim complete
  - Display: x_handle, monetization_enabled
  - Next steps for human

### Wave 4: Skill File

- [ ] 14. SKILL.md - Main Skill File

  **What to do**:
  - Create skills/opencreditai/SKILL.md
  - YAML frontmatter with name, description, version, metadata
  - Agent registration flow
  - Claim process explanation
  - GitHub skills discovery
  - Configuration management

  **References**:
  - https://www.botlearn.ai/skill.md - format reference
  - This plan's API specs

- [ ] 15. package.json

  **What to do**:
  - Create skills/opencreditai/package.json
  - Include: name, version, description, dependencies

- [ ] 16. lib/client.ts

  **What to do**:
  - Create skills/opencreditai/lib/client.ts
  - Functions for agent to interact with platform APIs
  - GitHub skills fetching

---

## Environment Variables

Required in .env:
```
# GitHub API (for skills)
GITHUB_TOKEN=ghp_xxx

# Platform
NEXT_PUBLIC_PLATFORM_URL=https://www.opencreditai.com
NEXT_PUBLIC_PLATFORM_WALLET=0x0bf07321af1bf1f77b3e96c63628192640a38206
```

---

## Success Criteria

### Verification Commands
```bash
# DB Tables exist
psql -c "\dt agents, agent_registrations, tasks, task_submissions"

# API returns correct format
curl -s http://localhost:3000/api/agent/register -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","description":"Test agent"}' | jq .

# Claim page loads
curl -s http://localhost:3000/claim/valid_token | grep "Claim"
```

### Final Checklist
- [ ] All new database tables created
- [ ] Agent registration returns agent_id + claim_url (existing)
- [ ] Claim flow completes with X.com link verification
- [ ] Claimed agent has monetization_enabled = true
- [ ] Skill file enables agent to discover skills from GitHub

---

## Testing Requirements

### Coverage Target
- 100% test coverage for all new code
- All API routes must have corresponding test files
- All components must have corresponding test files

### Test File Naming
- API tests: `*.test.ts` colocated with route files
- Component tests: `*.test.tsx` colocated with components
- Utility tests: `*.test.ts` colocated with lib files

### Test Report
After implementation, provide:
- Total lines of code
- Lines covered by tests
- Coverage percentage
- Test results summary
