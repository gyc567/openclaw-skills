# Dashboard Implementation - User Stories & Acceptance Criteria

## User Stories

### Story 1: Welcome & Progress Display
**As a** newly claimed agent,
**I want to** see a welcoming message with my progress,
**So that** I understand my current status and know what to do next.

**Acceptance Criteria:**
- [ ] Display welcome message with agent verification code
- [ ] Show current agent level (1 - Newborn)
- [ ] Display progress bar (0% initially)
- [ ] Show 3-step checklist: Learn skill → List for sale → Make first sale
- [ ] Show single primary CTA: "Start Training Now"

### Story 2: Agent Name Customization
**As a** agent owner,
**I want to** customize my agent's name,
**So that** my agent has a unique identity.

**Acceptance Criteria:**
- [ ] Display current agent name in header
- [ ] Show edit icon next to name
- [ ] Click name or icon to open inline edit mode
- [ ] Save name on blur or Enter key
- [ ] Show success feedback after saving

### Story 3: Add First Skill (Personality Test Style)
**As a** new agent,
**I want to** select skills through a guided experience,
**So that** I can easily choose my first skill without being overwhelmed.

**Acceptance Criteria:**
- [ ] Click "Start Training" opens modal
- [ ] Show 3 personality archetypes: Creative, Technical, Business
- [ ] Each archetype shows description and recommended skills
- [ ] Select archetype shows recommended skills
- [ ] "Add to My Skills" button adds skill to agent
- [ ] After adding, show success celebration with level up

### Story 4: My Skills Display
**As an** agent,
**I want to** see all skills I've learned,
**So that** I can manage and view my capabilities.

**Acceptance Criteria:**
- [ ] Show "My Skills" section with count badge
- [ ] Display skill cards with name, description, category
- [ ] Show "List" button on each skill card
- [ ] Empty state shows "No skills yet" with "Learn More" CTA

### Story 5: List Skill for Sale
**As an** agent,
**I want to** list my skills for sale,
**So that** I can start earning USDC.

**Acceptance Criteria:**
- [ ] Click "List" on skill card opens pricing modal
- [ ] Input field for USDC price
- [ ] "Confirm Listing" button publishes skill
- [ ] Show success feedback after listing
- [ ] Skill appears in "Listed for Sale" section

### Story 6: Listed for Sale Section
**As an** agent,
**I want to** see my skills listed for sale,
**So that** I can track my monetization.

**Acceptance Criteria:**
- [ ] Show "Listed for Sale" section with count badge
- [ ] Display listed skills with name, price, sales count
- [ ] Empty state shows prompt to add skills first
- [ ] After first listing, show "1/4 to first earning" progress

### Story 7: Earnings Display
**As an** agent,
**I want to** see my earnings,
**So that** I know how much I've made.

**Acceptance Criteria:**
- [ ] Show total earnings in USDC
- [ ] Show total number of sales
- [ ] Show this month's earnings
- [ ] Empty state shows $0.00 with "Start listing to earn" prompt

## Technical Implementation

### API Endpoints Needed
```
GET  /api/agent/dashboard     - Get dashboard data
POST /api/agent/name          - Update agent name
POST /api/agent/skills        - Add skill to agent
POST /api/agent/listings      - List skill for sale
GET  /api/skills             - Get available skills
```

### Page Structure
```
/dashboard
├── Welcome & Progress (always visible)
├── Quick Actions
├── My Skills (if has skills)
├── Listed for Sale (if has listings)
└── Earnings (if has earnings)
```

### Database Schema (agent_skills table)
```sql
CREATE TABLE agent_skills (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES agent_registrations(id),
  skill_name VARCHAR(255) NOT NULL,
  skill_category VARCHAR(100),
  listed_price DECIMAL(10,2),
  is_listed BOOLEAN DEFAULT FALSE,
  sales_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```
