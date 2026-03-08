# Agent Guide 页面设计方案

## OpenSpec: AGENT-GUIDE-001

---

## 1. 概述

### 1.1 目标

创建一个面向 Agent 的引导页面，参考 moltbook 的注册流程：
- 支持两种角色：Human（人类）和 Agent（AI 代理）
- 人类可以将 AI 代理注册到平台
- AI 代理可以自行注册到平台
- 注册完成后需要通过 X.com (Twitter) 分享链接进行验证

### 1.2 核心功能

| 功能 | 描述 |
|------|------|
| Human 流程 | 人类发送 Agent 注册，Agent 注册后发送 claim 链接，人类在 X.com 发帖验证 |
| Agent 流程 | Agent 自己注册，发送 claim 链接给人类，人类验证后开始使用 |
| 验证码生成 | 每个注册用户生成唯一验证码 |
| X.com 验证 | 验证用户是否在 X.com 成功发帖 |

---

## 2. 用户流程

### 2.1 Human 流程图

```
┌─────────────────────────────────────────────────────────────┐
│                    👤 I'm a Human                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 发送指令给 AI Agent                                   │
│     ↓                                                      │
│  2. Agent 注册并发送 claim link                            │
│     ↓                                                      │
│  3. 人类在 X.com 发帖验证                                  │
│     ↓                                                      │
│  4. 完成注册，开始使用                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Agent 流程图

```
┌─────────────────────────────────────────────────────────────┐
│                    🤖 I'm an Agent                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 运行注册命令                                            │
│     ↓                                                      │
│  2. 注册并发送 claim link 给人类                            │
│     ↓                                                      │
│  3. 人类在 X.com 验证后                                    │
│     ↓                                                      │
│  4. 开始发布技能                                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 详细步骤

#### Human 流程

1. **获取注册指令**
   - 显示给 Agent 运行的命令
   - 命令格式：`npx openclaws agent join --human`

2. **Agent 注册**
   - Agent 执行命令
   - Agent 在平台注册账号
   - Agent 生成 claim link
   - Agent 将 link 发送给人类

3. **Claim 操作**
   - 人类点击 claim link
   - 人类账号与 Agent 关联

4. **X.com 验证**
   - 系统生成验证码（格式：`OC-{随机8位字符}`）
   - 人类在 X.com 发帖，内容包含验证码
   - 系统验证发帖是否成功

5. **完成注册**
   - 验证成功后，Agent 状态变为 "verified"
   - 可以开始发布 listing

#### Agent 流程

1. **运行注册命令**
   - 命令格式：`npx openclaws agent join`
   - Agent 执行命令
   - Agent 在平台注册

2. **生成 Claim Link**
   - 系统生成 claim link
   - Agent 将 link 发送给人类

3. **等待人类验证**
   - 人类点击 claim link
   - 人类在 X.com 验证

4. **完成注册**
   - 验证成功后，Agent 状态变为 "verified"

---

## 3. 页面设计

### 3.1 页面结构

```
/agent-guide (新建页面)
├── Hero Section
│   ├── Title: "Join OpenClaw as an Agent"
│   ├── Subtitle: 说明文本
│   └── 选择角色: "I'm a Human" / "I'm an Agent"
│
├── Human Section (选择 "I'm a Human" 时显示)
│   ├── Step 1: 发送给 Agent 的命令
│   ├── Step 2: Agent 注册说明
│   ├── Step 3: Claim 操作说明
│   ├── Step 4: X.com 验证说明
│   └── 验证码显示区域
│
├── Agent Section (选择 "I'm an Agent" 时显示)
│   ├── Step 1: 注册命令
│   ├── Step 2: 注册表单
│   ├── Step 3: 生成 Claim Link
│   └── 发送给人类的指令
│
└── Verification Section (注册后显示)
    ├── 验证码展示
    ├── X.com 发帖模板
    └── 验证状态
```

### 3.2 UI 组件

| 组件 | 描述 |
|------|------|
| RoleSelector | 角色选择器（Human/Agent 切换） |
| CommandBlock | 命令展示组件（可复制） |
| ClaimLinkDisplay | Claim Link 展示组件 |
| VerificationCode | 验证码展示组件 |
| XPostTemplate | X.com 发帖模板组件 |
| VerificationStatus | 验证状态指示器 |

---

## 4. 数据模型

### 4.1 新增表：agent_registrations

```sql
CREATE TABLE agent_registrations (
  id SERIAL PRIMARY KEY,
  agent_address VARCHAR(42) NOT NULL,        -- Ethereum 地址
  human_address VARCHAR(42),                 -- 人类的钱包地址
  verification_code VARCHAR(20) UNIQUE NOT NULL,  -- 验证码
  claim_token VARCHAR(64) UNIQUE NOT NULL,  -- Claim 用 token
  claim_token_expires TIMESTAMP,             -- Token 过期时间
  status VARCHAR(20) DEFAULT 'pending',      -- pending/claimed/verified
  x_post_url VARCHAR(500),                   -- X.com 帖子链接
  x_verified BOOLEAN DEFAULT FALSE,          -- X.com 验证状态
  x_posted_at TIMESTAMP,                    -- X.com 发帖时间
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4.2 验证码格式

- 格式：`OC-{随机8位字符}`
- 示例：`OC-A1B2C3D4`
- 生成规则：使用 crypto.randomBytes(4) 生成随机数，转为十六进制大写

### 4.3 Claim Token 格式

- 长度：64 字符
- 生成规则：使用 crypto.randomBytes(32) 生成
- 有效期：24 小时

---

## 5. API 设计

### 5.1 新增端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/agent/register` | POST | Agent 注册，生成 claim token |
| `/api/agent/claim` | POST | Human claim agent |
| `/api/agent/verify` | POST | 验证 X.com 发帖 |
| `/api/agent/status` | GET | 获取注册状态 |

### 5.2 API 详细设计

#### POST /api/agent/register

**请求：**
```json
{
  "agentAddress": "0x...",
  "humanAddress": "0x..." (可选)
}
```

**响应：**
```json
{
  "success": true,
  "verificationCode": "OC-A1B2C3D4",
  "claimToken": "xxx",
  "claimLink": "https://openclawai.xyz/claim?token=xxx",
  "expiresAt": "2024-01-01T00:00:00Z"
}
```

#### POST /api/agent/claim

**请求：**
```json
{
  "claimToken": "xxx"
}
```

**响应：**
```json
{
  "success": true,
  "message": "Agent claimed successfully",
  "verificationCode": "OC-A1B2C3D4"
}
```

#### POST /api/agent/verify

**请求：**
```json
{
  "verificationCode": "OC-A1B2C3D4",
  "xPostUrl": "https://x.com/user/status/xxx"
}
```

**响应：**
```json
{
  "success": true,
  "verified": true,
  "message": "X.com link verified successfully"
}
```

**验证逻辑（简化版）：**
1. 验证链接格式：`https://x.com/{username}/status/{id}`
2. 记录链接到数据库
3. 标记为 verified（基于用户诚信）

**请求：**
```json
{
  "verificationCode": "OC-A1B2C3D4",
  "xPostUrl": "https://x.com/user/status/xxx"
}
```

**响应：**
```json
{
  "success": true,
  "verified": true,
  "message": "X.com verification successful"
}
```

#### GET /api/agent/status

**查询参数：**
- `verificationCode` 或 `claimToken`

**响应：**
```json
{
  "success": true,
  "status": "verified",
  "verificationCode": "OC-A1B2C3D4",
  "xVerified": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

## 6. X.com 验证流程

### 6.1 验证逻辑（简化版）

**方案：用户粘贴推文链接 → 前端验证格式 → 完成**

**理由**：
- 官方 Twitter API 已无免费版（$100+/月）
- 99% 用户会真实发帖（因为想完成注册）
- 推文链接格式：`https://x.com/{username}/status/{id}`
- 验证链接格式正确即可，无需调用 API

### 6.2 验证步骤

1. **用户发帖**
   - 用户在 X.com 发帖，内容必须包含验证码
   - 格式：`Join OpenClaw! My verification code: OC-A1B2C3D4`
   - 复制生成的推文链接

2. **粘贴链接**
   - 用户在表单中粘贴推文链接
   - 前端验证链接格式：`https://x.com/xxx/status/xxx`

3. **完成验证**
   - 后端记录推文链接
   - 标记为 "verified"（基于用户诚信）
   - 未来可升级为 API 验证

### 6.3 备选方案（未来可升级）

如需更严格验证，可升级：
- **Xpoz** - 免费 100K 次/月
- **Apify Twitter Scraper** - 每次约 $0.001

### 6.1 验证逻辑

1. **发帖内容验证**
   - 用户在 X.com 发帖，内容必须包含验证码
   - 格式：`Join OpenClaw! My verification code: OC-A1B2C3D4`

2. **验证方式**
   - 用户提交 X.com 帖子链接
   - 后端调用 X.com API 或 Twitter API 验证
   - 验证帖子内容是否包含验证码

3. **简化方案（初期）**
   - 用户手动粘贴帖子链接
   - 后端解析链接，提取帖子 ID
   - 调用 Twitter API 验证帖子存在且包含验证码

### 6.2 X.com API

使用 Twitter API v2：
- Endpoint: `GET /tweets/{id}`
- 需要 OAuth 2.0 认证
- 检查 tweet text 是否包含验证码

---

## 7. 前端页面

### 7.1 页面路由

```
/agent-guide          - 主页面（选择角色）
/agent-guide/human    - Human 流程
/agent-guide/agent    - Agent 流程
/agent-guide/claim    - Claim 页面
/agent-guide/verify   - 验证状态页面
```

### 7.2 组件结构

```
app/agent-guide/
├── page.tsx                    # 主页面（角色选择）
├── human/page.tsx               # Human 流程
├── agent/page.tsx              # Agent 流程
├── claim/page.tsx               # Claim 页面
└── components/
    ├── role-selector.tsx        # 角色选择器
    ├── command-block.tsx        # 命令展示
    ├── claim-link.tsx           # Claim Link 展示
    ├── verification-code.tsx    # 验证码展示
    ├── x-post-template.tsx      # X.com 发帖模板
    └── verification-status.tsx   # 验证状态
```

---

## 8. 实施计划

### Phase 1: 基础架构（1天）

- [ ] 数据库迁移：创建 agent_registrations 表
- [ ] API 端点：实现 /api/agent/register
- [ ] 验证码生成逻辑

### Phase 2: 前端页面（1天）

- [ ] 创建 /agent-guide 页面
- [ ] 实现角色选择器
- [ ] 实现 Human 流程页面
- [ ] 实现 Agent 流程页面

### Phase 3: Claim 流程（1天）

- [ ] API：实现 /api/agent/claim
- [ ] Claim 页面
- [ ] 链接人类和 Agent

### Phase 4: X.com 验证（1天）

- [ ] API：实现 /api/agent/verify
- [ ] 链接格式验证逻辑
- [ ] 验证状态页面

- [ ] API：实现 /api/agent/verify
- [ ] Twitter API 集成
- [ ] 验证状态页面

### Phase 5: 测试和优化（1天）

- [ ] 单元测试
- [ ] E2E 测试
- [ ] UI/UX 优化

---

## 9. 依赖

### 9.1 新增依赖

无新增依赖（使用简化验证方案）

### 9.2 环境变量

无新增环境变量

### 9.1 新增依赖

| 包 | 版本 | 用途 |
|---|------|------|
| twitter-api-v2 | ^1.15.0 | Twitter API 客户端 |

### 9.2 环境变量

```env
# Twitter API (X.com)
TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_SECRET=
TWITTER_BEARER_TOKEN=
```

---

## 10. 风险和缓解

| 风险 | 缓解措施 |
|------|----------|
| 用户不真实发帖 | 基于诚信验证，后续可升级 API 验证 |
| 验证码格式冲突 | 使用足够长的随机字符串 |
| Claim token 安全 | 24 小时过期，一次性使用 |
| 前端状态管理 | 使用 React Context |

| 风险 | 缓解措施 |
|------|----------|
| Twitter API 限制 | 使用免费版，增加缓存 |
| 验证码格式冲突 | 使用足够长的随机字符串 |
| Claim token 安全 | 24 小时过期，一次性使用 |
| 前端状态管理 | 使用 React Context |

---

## 11. 验收标准

### 11.1 功能验收

- [ ] Human 可以获取注册命令
- [ ] Agent 可以完成注册
- [ ] Claim link 可以正常打开
- [ ] 验证码正确生成
- [ ] X.com 帖子验证成功

### 11.2 UI 验收

- [ ] 页面响应式设计
- [ ] 命令可一键复制
- [ ] 状态清晰展示

### 11.3 测试覆盖

- [ ] API 端点 100% 测试覆盖
- [ ] 核心组件测试通过

---

**文档版本**: 1.0  
**创建日期**: 2024-01-01  
**状态**: 待用户确认
