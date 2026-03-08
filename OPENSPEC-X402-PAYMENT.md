# OpenSpec: x402 Payment Protocol Integration

## Proposal ID
OS-2026-0307-001

## Summary
为OpenClawSkills Marketplace集成x402支付协议，支持AI Agent原生微支付。实现基于Base链的USDC稳定币支付，允许用户通过加密钱包（MetaMask、Coinbase Wallet）进行每请求付费，实现金融数据分析（美股、外汇、加密货币）等服务的微支付交易。平台抽成5%，使用第三方Facilitator进行支付验证和结算。

## Requirements

### Functional Requirements

1. **FR-001**: 数据库架构 - 创建listings、wallets、transactions、x402_sessions、purchases表
2. **FR-002**: x402 Middleware - 实现HTTP 402响应处理和PAYMENT-REQUIRED/PAYMENT-SIGNATURE头部解析
3. **FR-003**: Wallet连接 - 集成Base链钱包（MetaMask、Coinbase Wallet、Rabby）
4. **FR-004**: 支付验证 - 集成第三方Facilitator进行支付签名验证
5. **FR-005**: Listings CRUD - 创建、读取、更新、发布技能/人格列表
6. **FR-006**: 购买流程 - 完整的购买流程（连接钱包→确认价格→x402支付→获取内容）
7. **FR-007**: 金融API - 实现美股、外汇、加密货币分析的x402付费端点
8. **FR-008**: Creator API - 支持开发者通过API程序化发布和销售技能
9. **FR-009**: 收入仪表板 - Creator收入统计和提现功能
10. **FR-010**: 抽成系统 - 5%平台抽成自动计算
11. **FR-011**: 退款机制 - 用户可在购买后7天内申请退款
12. **FR-012**: 提现功能 - 最低提现金额$50，支持周期性提现

### Non-Functional Requirements

1. **NFR-001**: Base测试网优先 - 首次部署在Base Sepolia测试网
2. **NFR-002**: Gasless交易 - 使用EIP-3009实现无Gas USDC转账
3. **NFR-003**: 安全第一 - 钱包签名验证、支付验证、双重确认
4. **NFR-004**: 开发者体验 - 清晰的API文档和错误消息
5. **NFR-005**: 兼容性 - 传统支付（非x402）回退支持
6. **NFR-006**: 退款政策 - 7天无理由退款
7. **NFR-007**: 提现门槛 - 最低$50方可提现

---

## Architecture

### 技术栈
```
前端: Next.js 16 + React 19 + TypeScript + Tailwind CSS v4
后端: Next.js API Routes + Neon Database (PostgreSQL)
支付: x402 Protocol + USDC (Base Chain)
钱包: MetaMask, Coinbase Wallet, Rabby (via window.ethereum)
Facilitator: 第三方服务 (PayAI / 0xPass)
```

### 数据流架构
```
┌─────────────┐     402 + PAYMENT-REQUIRED      ┌─────────────┐
│   Client    │ ◄────────────────────────────── │   Server    │
│  (AI Agent) │                                 │  (Next.js)  │
└─────────────┘                                 └──────┬──────┘
       │                                                 │
       │ PAYMENT-SIGNATURE (signed EIP-3009)            │
       └──────────────────────────────────────────────►  │
                                                         │
                                                         ▼
                                              ┌─────────────────┐
                                              │   Facilitator   │
                                              │ (第三方支付验证)  │
                                              └────────┬────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │ Base Chain      │
                                              │ (USDC Transfer) │
                                              └─────────────────┘
```

### 数据库架构
```sql
-- listings 表 (取代静态skills)
listings (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES agents(id),
  type VARCHAR(20), -- 'skill' | 'persona' | 'template'
  name VARCHAR(255),
  description TEXT,
  category VARCHAR(50),
  price_usd DECIMAL(10,4) DEFAULT 0, -- $0 = free
  is_published BOOLEAN DEFAULT false,
  version VARCHAR(20) DEFAULT '1.0.0',
  package_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- wallets 表
wallets (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES agents(id) UNIQUE,
  address VARCHAR(42), -- Ethereum address
  chain VARCHAR(20) DEFAULT 'base',
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP
)

-- transactions 表
transactions (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER REFERENCES listings(id),
  buyer_wallet VARCHAR(42),
  seller_agent_id INTEGER REFERENCES agents(id),
  amount_usd DECIMAL(10,4),
  amount_raw VARCHAR(50),
  tx_hash VARCHAR(66),
  status VARCHAR(20), -- 'pending' | 'settled' | 'failed'
  facilitator VARCHAR(255),
  platform_fee DECIMAL(10,4), -- 5% 抽成
  created_at TIMESTAMP,
  settled_at TIMESTAMP
)

-- x402_sessions 表
x402_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(64) UNIQUE,
  listing_id INTEGER REFERENCES listings(id),
  buyer_wallet VARCHAR(42),
  amount_usd DECIMAL(10,4),
  expires_at TIMESTAMP,
  status VARCHAR(20), -- 'active' | 'used' | 'expired'
  created_at TIMESTAMP
)

purchases (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER REFERENCES listings(id),
  buyer_id INTEGER REFERENCES users(id),
  buyer_wallet VARCHAR(42),
  transaction_id INTEGER REFERENCES transactions(id),
  amount_usd DECIMAL(10,4),
  purchased_at TIMESTAMP
)

-- refunds 表 (7天内可申请退款)
refunds (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER REFERENCES transactions(id),
  buyer_id INTEGER REFERENCES users(id),
  amount_usd DECIMAL(10,4),
  reason TEXT,
  status VARCHAR(20), -- 'pending' | 'approved' | 'rejected' | 'processed'
  requested_at TIMESTAMP,
  processed_at TIMESTAMP
)

-- payouts 表 (提现记录)
payouts (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES agents(id),
  amount_usd DECIMAL(10,4),
  fee_usd DECIMAL(10,4), -- 提现手续费
  status VARCHAR(20), -- 'pending' | 'processing' | 'completed' | 'failed'
  wallet_address VARCHAR(42),
  tx_hash VARCHAR(66),
  requested_at TIMESTAMP,
  processed_at TIMESTAMP
)
purchases (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER REFERENCES listings(id),
  buyer_id INTEGER REFERENCES users(id),
  buyer_wallet VARCHAR(42),
  transaction_id INTEGER REFERENCES transactions(id),
  amount_usd DECIMAL(10,4),
  purchased_at TIMESTAMP
)
```

### 目录结构
```
lib/
├── x402/
│   ├── index.ts           # 核心x402逻辑
│   ├── middleware.ts      # Next.js中间件
│   ├── client.ts          # 客户端SDK
│   └── types.ts           # 类型定义
├── payments/
│   ├── index.ts           # 支付处理
│   ├── facilitator.ts      # Facilitator集成
│   └── transactions.ts     # 交易记录
├── wallet/
│   ├── index.ts           # 钱包管理
│   └── verification.ts    # 钱包验证
└── db/
    └── migrations/         # 数据库迁移

app/
├── api/
│   ├── listings/
│   ├── payments/
│   ├── wallet/
│   ├── analysis/
│   │   ├── stocks/[symbol]/
│   │   ├── forex/[pair]/
│   │   └── crypto/[symbol]/
│   └── v1/
└── dashboard/
    └── creator/

components/
├── wallet/
├── purchase/
├── listing/
└── price/
```

---

## Implementation Plan

### Phase 1: Database & Core Infrastructure (2 days)

- [ ] 创建数据库迁移脚本
  - [ ] listings表
  - [ ] wallets表
  - [ ] transactions表
  - [ ] x402_sessions表
  - [ ] purchases表

- [ ] 实现x402核心库
  - [ ] lib/x402/types.ts - 类型定义
  - [ ] lib/x402/index.ts - PaymentRequirement创建
  - [ ] lib/x402/middleware.ts - Next.js中间件
  - [ ] lib/x402/client.ts - 客户端SDK

### Phase 2: Wallet Integration (1 day)

- [ ] 钱包连接组件
  - [ ] components/wallet/connect.tsx
  - [ ] components/wallet/verify.tsx

- [ ] 钱包API
  - [ ] POST /api/wallet/register
  - [ ] POST /api/wallet/verify

### Phase 3: Listings & Payments (2 days)

- [ ] Listings API
  - [ ] GET /api/listings
  - [ ] POST /api/listings
  - [ ] GET /api/listings/[id]

- [ ] Payments API
  - [ ] POST /api/payments/verify
  - [ ] POST /api/payments/settle

- [ ] 购买组件
  - [ ] components/purchase/modal.tsx
  - [ ] components/price/display.tsx

### Phase 4: Financial Analysis APIs (3 days)

- [ ] 美股分析API
  - [ ] GET /api/analysis/stocks/[symbol]
  - [ ] x402定价: $0.001/基础, $0.01/深度, $0.05/实时

- [ ] 外汇分析API
  - [ ] GET /api/analysis/forex/[pair]
  - [ ] x402定价: $0.0005/请求

- [ ] 加密货币分析API
  - [ ] GET /api/analysis/crypto/[symbol]
  - [ ] x402定价: $0.001/基础, $0.01/深度

### Phase 5: Creator API (2 days)

- [ ] API认证
  - [ ] API Key生成和管理
  - [ ] 认证中间件

- [ ] Listings管理
  - [ ] POST /api/v1/listings
  - [ ] POST /api/v1/listings/[id]/versions
  - [ ] GET /api/v1/listings/[id]

### Phase 6: Dashboard (2 days)

- [ ] Creator仪表板
  - [ ] 收入概览
  - [ ] 交易历史

- [ ] 提现功能 ($50最低门槛)
  - [ ] POST /api/payouts/request - 申请提现
  - [ ] GET /api/payouts/history - 提现历史
  - [ ] Minimum payout validation ($50)

- [ ] 退款功能 (7天无理由)
  - [ ] POST /api/refunds/request - 申请退款
  - [ ] GET /api/refunds/history - 退款历史
  - [ ] Auto-approve within 7 days

- [ ] Creator仪表板
  - [ ] 收入概览
  - [ ] 交易历史
  - [ ] 提现功能

---

## x402 Protocol Implementation Details

### HTTP 402响应示例
```http
HTTP/1.1 402 Payment Required
Content-Type: application/json
PAYMENT-REQUIRED: eyJ4MDAyVmVyc2lvbiI6MiwicmVzb3VyY2UiOnsidXJsIjoiaHR0cHM6Ly9hcGkub3BlbmNsYXc...

{
  "x402Version": 2,
  "error": "PAYMENT-SIGNATURE header is required",
  "resource": {
    "url": "https://api.openclaw.com/analysis/stocks/AAPL",
    "description": "Premium stock analysis for AAPL"
  },
  "accepts": [
    {
      "scheme": "exact",
      "network": "eip155:84532", -- Base Sepolia
      "amount": "1000", -- 0.001 USDC (in micro-USDC)
      "asset": "USDC",
      "payTo": "0xSellerWalletAddress"
    }
  ],
  "expires": 1735689600000
}
```

### 客户端请求示例
```typescript
// 使用@x402/fetch
import { x402Fetch } from "@x402/fetch";

const response = await x402Fetch("https://api.openclaw.com/analysis/stocks/AAPL", {
  payer: walletAddress,
  // 自动处理402响应并重试
});

// 或者手动处理
const res = await fetch("https://api.openclaw.com/analysis/stocks/AAPL");
if (res.status === 402) {
  const requirement = JSON.parse(atob(res.headers.get("PAYMENT-REQUIRED")));
  const signature = await wallet.signPayment(requirement);
  const retry = await fetch("https://api.openclaw.com/analysis/stocks/AAPL", {
    headers: { "PAYMENT-SIGNATURE": signature }
  });
}
```

### Facilitator集成
```typescript
// 第三方Facilitator (PayAI / 0xPass)
interface FacilitatorConfig {
  endpoint: string;  // https://facilitator.payai.io
  apiKey: string;
}

async function verifyPayment(signature: string, requirement: PaymentRequirement) {
  const response = await fetch(`${config.endpoint}/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      signature,
      requirement
    })
  });
  
  return response.json(); // { valid: true, txHash: "0x..." }
}

async function settlePayment(verifiedData: VerifiedPayment) {
  const response = await fetch(`${config.endpoint}/settle`, {
    method: "POST",
    body: JSON.stringify(verifiedData)
  });
  
  return response.json(); // { settled: true, amount: "1000" }
}
```

---

## 抽成系统设计

### 5%平台抽成计算
```typescript
function calculatePlatformFee(amountUsd: number): number {
  const fee = amountUsd * 0.05; // 5%
  return Math.round(fee * 10000) / 10000; // 保留4位小数
}

function calculateSeller earnings(amountUsd: number): number {
  return amountUsd * 0.95; // 开发者获得95%
}

// 示例
// 用户支付 $1.00
// 平台抽成: $0.05
// 开发者收入: $0.95
```

### 结算流程
```sql
-- transactions表记录
INSERT INTO transactions (
  listing_id, buyer_wallet, seller_agent_id,
  amount_usd, amount_raw, tx_hash,
  status, facilitator, platform_fee
) VALUES (
  1, '0xBuyer...', 5,
  1.00, '1000000', '0xTxHash...',
  'settled', 'payai', 0.05
);

-- 开发者收入记录
INSERT INTO purchases (
  listing_id, buyer_id, buyer_wallet,
  transaction_id, amount_usd
) VALUES (
  1, 10, '0xBuyer...',
  100, 0.95 -- 开发者实际收入
);
```

---

## Security Considerations

### 钱包验证
1. 用户连接钱包后需签名验证消息
2. 签名消息包含时间戳防止重放攻击
3. 服务器验证签名确认钱包所有权

### 支付验证
1. 所有支付需通过Facilitator验证
2. 链上确认 + Facilitator确认双重验证
3. 使用EIP-3009防止双重支付

### Rate Limiting
```typescript
// 每个钱包每分钟最大请求数
const RATE_LIMIT = {
  windowMs: 60000, // 1分钟
  maxRequests: 100
};
```

---

## Testing Strategy

### 单元测试
- x402中间件逻辑测试
- 支付计算测试
- 钱包验证测试

### 集成测试
- 完整支付流程测试
- Creator API测试

### E2E测试
- 钱包连接流程
- 购买完整流程
- Creator发布流程

---

## Success Metrics

- [ ] 用户可在3步内完成购买
- [ ] 支付成功率 > 99%
- [ ] 平均支付延迟 < 2秒
- [ ] Creator可在5分钟内发布第一个技能
- [ ] 5%抽成正确计算

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Facilitator服务不可用 | High | 实现本地验证回退 |
| 钱包连接失败 | Medium | 提供多钱包选项 |
| 链上拥堵 | Medium | 使用Layer 2 (Base) |
| 智能合约风险 | High | 使用知名稳定币 (USDC) |
| 用户不会用钱包 | Medium | 提供详细教程 |

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-07 | Base链作为主链 | 低Gas费用、快速确认、USDC支持 |
| 2026-03-07 | 第三方Facilitator | 简化集成、减少复杂度 |
| 2026-03-07 | 5%抽成 | 低于行业平均、吸引开发者 |
| 2026-03-07 | Base Sepolia测试网 | 真实环境测试、无真实资金风险 |
| 2026-03-07 | 支持退款机制 | 7天无理由退款，保护消费者 |
| 2026-03-07 | 最低提现$50 | 覆盖手续费成本，防止小額提现滥用 |

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-07 | Base链作为主链 | 低Gas费用、快速确认、USDC支持 |
| 2026-03-07 | 第三方Facilitator | 简化集成、减少复杂度 |
| 2026-03-07 | 5%抽成 | 低于行业平均、吸引开发者 |
| 2026-03-07 | Base Sepolia测试网 | 真实环境测试、无真实资金风险 |

---

## Open Questions

**All questions resolved:**
- ✅ Solana: No (Base only)
- ✅ Subscription: No (pay-per-request only)
- ✅ Refunds: Yes (7 days)
- ✅ Minimum payout: Yes ($50)
- ✅ Solana: No (Base only)
- ✅ Subscription: No (pay-per-request only)
- ✅ Refunds: Yes (7 days)
- ✅ Minimum payout: Yes ($50)

1. 是否需要支持Solana链？
2. 是否需要实现订阅制（而非纯按量付费）？
3. 是否需要实现退款机制？
4. Creator提现是否需要最低金额限制？

---

**Status**: IN PROGRESS
**Author**: OpenSpec Generator
**Date**: 2026-03-07

**Status**: PROPOSED
**Author**: OpenSpec Generator
**Date**: 2026-03-07
