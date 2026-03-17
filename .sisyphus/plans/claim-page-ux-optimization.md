# Claim Page UX 优化实施计划

## 目标
优化 `/claim/{token}` 页面的用户体验，减少操作步骤，提升完成率。

## 问题诊断

| 优先级 | 问题 | 状态 |
|--------|------|------|
| P0 | Token 获取方式错误 - 使用 useSearchParams 但 token 在路径中 | 🔴 阻塞 |
| P1 | 无一键跳转 X.com 按钮 | 🟠 高 |
| P2 | 推文内容不提前展示 | 🟠 高 |
| P3 | 无进度指示器 | 🟡 中 |
| P4 | 无剪贴板检测 | 🟢 低 |

---

## 实施任务

### T1: P0 - 修复 Token Bug

**文件**: `app/claim/[token]/page.tsx`

**修改内容**:
```typescript
// 之前 (错误)
const searchParams = useSearchParams();
const token = searchParams.get("token");

// 之后 (正确)
const params = useParams();
const token = params.token as string;
```

**验收标准**:
- [ ] 访问 `/claim/{token}` 不再显示 "Invalid claim link"
- [ ] Token 正确传递给后续 API 调用

---

### T2: P1 - 添加一键跳转 X.com 按钮

**文件**: `app/claim/[token]/page.tsx`

**修改内容**:
1. 在 Step 2 (x_verify) 页面添加跳转按钮
2. 预构建推文 URL：
```typescript
const tweetText = encodeURIComponent(
  `Verifying my wallet for @OpenCreditAI agent ${verificationCode} ${walletAddress}`
);
const tweetUrl = `https://x.com/intent/tweet?text=${tweetText}`;
```

3. 添加按钮：
```tsx
<Button
  onClick={() => window.open(tweetUrl, "_blank")}
  className="w-full bg-[#1DA1F2] hover:bg-[#1a91da]"
>
  <Twitter className="w-4 h-4 mr-2" />
  🚀 Post on X.com
</Button>
```

**验收标准**:
- [ ] 点击按钮打开 X.com 发推页面
- [ ] 推文内容预填充

---

### T3: P2 - 提前显示推文内容预览

**文件**: `app/claim/[token]/page.tsx`

**修改内容**:
1. 在 Step 1 (wallet) 页面添加推文预览
2. 在用户连接钱包后立即显示推文内容

```tsx
{walletAddress && (
  <div className="bg-secondary/50 rounded-lg p-4 mt-4">
    <p className="text-sm text-muted-foreground mb-2">
      📝 Your verification tweet (after connecting wallet):
    </p>
    <div className="bg-background rounded p-3 font-mono text-sm">
      Verifying my wallet for @OpenCreditAI agent {'{verificationCode}'}
      {'{walletAddress}}'}
    </div>
  </div>
)}
```

**验收标准**:
- [ ] 连接钱包后显示推文预览
- [ ] 推文包含占位符，稍后替换为真实值

---

### T4: P3 - 添加进度指示器

**文件**: `app/claim/[token]/page.tsx`

**修改内容**:
1. 在页面顶部添加步骤指示

```tsx
<div className="flex items-center justify-center gap-2 mb-8">
  <div className={`flex items-center gap-2 ${step === "wallet" ? "text-accent" : "text-green-500"}`}>
    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">1</div>
    <span className="text-sm">Wallet</span>
  </div>
  <div className="w-8 h-px bg-border" />
  <div className={`flex items-center gap-2 ${step === "x_verify" ? "text-accent" : step === "complete" ? "text-green-500" : "text-muted-foreground"}`}>
    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">2</div>
    <span className="text-sm">X Verify</span>
  </div>
  <div className="w-8 h-px bg-border" />
  <div className={`flex items-center gap-2 ${step === "complete" ? "text-green-500" : "text-muted-foreground"}`}>
    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">3</div>
    <span className="text-sm">Done</span>
  </div>
</div>
```

**验收标准**:
- [ ] 当前步骤高亮显示
- [ ] 完成的步骤显示绿色

---

### T5: P4 - 添加剪贴板检测功能

**文件**: `app/claim/[token]/page.tsx`

**修改内容**:
1. 在 X 验证页面添加剪贴板粘贴按钮

```tsx
const pasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (text.includes("x.com") || text.includes("twitter.com")) {
      setXLink(text);
    }
  } catch {
    // 用户拒绝剪贴板权限，静默失败
  }
};

// 在 Input 旁边添加按钮
<div className="flex gap-2">
  <Input ... />
  <Button variant="outline" size="icon" onClick={pasteFromClipboard}>
    <Clipboard className="w-4 h-4" />
  </Button>
</div>
```

**验收标准**:
- [ ] 点击按钮尝试读取剪贴板
- [ ] 如果包含 x.com URL，自动填充

---

## 页面结构预览

```
/claim/[token]/page.tsx

┌─────────────────────────────────────────────┐
│  Progress: ● ─ ● ─ ○                       │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  ┌─────────────────────────────────────┐  │
│  │  👜 Connect Wallet                  │  │
│  │                                     │  │
│  │  ┌─────────────────────────────┐   │  │
│  │  │ 0x742d...3Cf4              │   │  │
│  │  └─────────────────────────────┘   │  │
│  │                                     │  │
│  │  📝 Preview your tweet:            │  │
│  │  ┌─────────────────────────────┐   │  │
│  │  │ Verifying my wallet for     │   │  │
│  │  │ @OpenCreditAI agent OC-XXXX │   │  │
│  │  │ 0x742d...3Cf4              │   │  │
│  │  └─────────────────────────────┘   │  │
│  │                                     │  │
│  │  [Sign & Continue]                  │  │
│  └─────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  ┌─────────────────────────────────────┐  │
│  │  ✅ Wallet Connected                │  │
│  │                                     │  │
│  │  📝 Your verification code:        │  │
│  │  ┌─────────────────────────────┐   │  │
│  │  │ OC-XXXXXXXX                │   │  │
│  │  └─────────────────────────────┘   │  │
│  │                                     │  │
│  │  [🚀 Post on X.com]                │  │
│  │                                     │  │
│  │  ─────── or ───────               │  │
│  │                                     │  │
│  │  [📋 Paste your link]              │  │
│  │  ┌─────────────────────────────┐   │  │
│  │  | x.com/username/status/xxx  │   │  │
│  │  └─────────────────────────────┘   │  │
│  │                                     │  │
│  │  [Verify & Complete]               │  │
│  └─────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## 测试验收

### 功能测试
- [ ] Token 正确获取
- [ ] 钱包连接成功
- [ ] 签名流程正常
- [ ] 一键跳转 X.com 正常工作
- [ ] 链接粘贴功能正常
- [ ] 验证完成后跳转 Dashboard

### UI 测试
- [ ] 进度指示器正确显示
- [ ] 推文预览内容正确
- [ ] 响应式布局正常
- [ ] 错误提示清晰

---

## 相关文件

- `app/claim/[token]/page.tsx` - 主要修改
- `app/api/agent/claim/start/route.ts` - 无需修改
- `app/api/agent/claim/complete/route.ts` - 无需修改
