# Navbar Login System - User Stories & Acceptance Criteria

## User Stories

### Story 1: Login Button Display
**As a** visitor,
**I want to** see a login button in the navbar,
**So that** I know how to connect my wallet.

**Acceptance Criteria:**
- [ ] Navbar shows "Login" or "Get Started" button
- [ ] Button is prominently placed in top-right
- [ ] Button is styled consistently with design system

### Story 2: Wallet Connection Flow
**As a** user clicking login,
**I want to** see available wallets and connect,
**So that** I can authenticate.

**Acceptance Criteria:**
- [ ] Click login opens wallet selection modal
- [ ] Shows list of supported wallets (MetaMask, Coinbase, Rabby, Rainbow, etc.)
- [ ] Each wallet has install link if not detected
- [ ] "More options" shows additional wallets
- [ ] Connection shows loading state
- [ ] Success shows address/balance

### Story 3: Base Network Detection
**As a** connected user,
**I want to** be on Base network,
**So that** I can use the platform.

**Acceptance Criteria:**
- [ ] Detect current chain on connection
- [ ] If wrong chain, show warning modal
- [ ] Auto-switch to Base if possible
- [ ] Show manual switch instructions if auto-fail
- [ ] Chain ID: 0x2105 (Base Mainnet)

### Story 4: Logged In State Display
**As a** logged-in user,
**I want to** see my balance in navbar,
**So that** I know my account status.

**Acceptance Criteria:**
- [ ] Show USDC balance in navbar
- [ ] Click shows dropdown menu
- [ ] Dropdown shows: Dashboard, Settings, Disconnect
- [ ] Format: "$XX.XX"

### Story 5: No Agent Handling
**As a** logged-in user without an agent,
**I want to** be guided to create one,
**So that** I can start using the platform.

**Acceptance Criteria:**
- [ ] Detect if user has agent on login
- [ ] If no agent, show welcome modal
- [ ] Show 3-step journey preview
- [ ] CTA button to create agent

### Story 6: Error Handling
**As a** user with connection issues,
**I want to** see helpful error messages,
**So that** I can resolve the problem.

**Acceptance Criteria:**
- [ ] Show "Connection Failed" with retry option
- [ ] Show specific error (rejected, timeout, etc.)
- [ ] "Get Help" link for support

### Story 7: Mobile Responsive
**As a** mobile user,
**I want to** have a usable login experience,
**So that** I can access on phone.

**Acceptance Criteria:**
- [ ] Login button visible on mobile
- [ ] Dropdown menu works on tap
- [ ] Wallet selection fits mobile screen

## Technical Implementation

### Supported Wallets
- MetaMask
- Coinbase Wallet
- Rabby
- Rainbow
- Trust Wallet
- OKX Wallet
- BitKeep

### Chain Config
```typescript
const BASE_CHAIN_ID = "0x2105"; // Base Mainnet
const BASE_SEPOLIA = "0x14a34"; // Base Sepolia (testnet)
```

### USDC Contract (Base)
```
Address: 0x833589fCD6eDb6E08f4c7C32D4d71eBal55E11e9
Decimals: 6
```

### Components
- NavbarLogin: Main login button + dropdown
- WalletModal: Wallet selection modal
- NetworkWarning: Wrong network modal
- NoAgentModal: Welcome modal for new users
