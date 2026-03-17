# Unified Auth Flow - User Stories & Acceptance Criteria

## User Stories

### Story 1: Unified Entry Point
**As a** user visiting any entry point,
**I want to** be automatically redirected to the right place based on my status,
**So that** I don't need to figure out where to go.

**Acceptance Criteria:**
- [ ] User visits /seller/register
- [ ] Connect wallet triggers status check
- [ ] If no agent → show registration form
- [ ] If has agent + verified → redirect to /dashboard?agentId=X
- [ ] If has agent + pending claim → redirect to /claim/token

### Story 2: Agent Status Detection
**As a** connected wallet,
**I want to** know my current agent status instantly,
**So that** the system can guide me to the right next step.

**Acceptance Criteria:**
- [ ] API endpoint: GET /api/agent/status?address=0x...
- [ ] Returns: agentId, status (none/pending/verified), claimToken
- [ ] Status "none": no agent created
- [ ] Status "pending": agent created but X verification not complete
- [ ] Status "verified": agent fully claimed and ready

### Story 3: Smart Redirect on Connect
**As a** user connecting wallet,
**I want to** be automatically taken to the right page,
**So that** I don't see "register" when I'm already registered.

**Acceptance Criteria:**
- [ ] On wallet connect in /seller/register
- [ ] Call status API immediately
- [ ] If verified → redirect to Dashboard
- [ ] If pending → redirect to Claim page
- [ ] If none → show form

### Story 4: Status Indicator Display
**As a** user,
**I want to** see clear status indicators,
**So that** I know what's happening.

**Acceptance Criteria:**
- [ ] Show loading spinner during status check
- [ ] Show success message on redirect
- [ ] Show error message if check fails

### Story 5: Claim Status Handling
**As a** user with pending agent,
**I want to** continue from where I left off,
**So that** I don't lose my progress.

**Acceptance Criteria:**
- [ ] If status is "pending" → redirect to /claim/{claimToken}
- [ ] User can continue the claim process
- [ ] After completion → redirect to Dashboard

## Technical Implementation

### API Endpoint
```
GET /api/agent/status?address=0x...
Response: {
  hasAgent: boolean,
  agentId?: number,
  status: "none" | "pending" | "verified",
  claimToken?: string,
  verificationCode?: string
}
```

### Page Flow
```
/seller/register
  ↓
connectWallet()
  ↓
fetchStatus(address)
  ↓
┌─────────┬─────────┬─────────┐
↓         ↓         ↓
none    pending  verified
↓         ↓         ↓
show    redirect redirect
form    toClaim  toDashboard
```

### Components
- useAgentStatus() hook
- StatusChecker component
- SmartRedirect component
