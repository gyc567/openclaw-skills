# OpenSpec: Claw Dojo 一键安装功能重构

## 1. 概述

重构 Claw Dojo 页面，简化新 OpenClaw 小龙虾一键安装必备技能包的流程，让新装小龙虾能够立即具备基础能力，并提供清晰的进阶路径。

## 2. 现状分析

### 当前问题
1. 用户需要手动复制安装命令到终端执行
2. 缺乏即时反馈机制
3. 技能分类不够清晰，新用户不知道从何入手
4. 没有提供安装后的验证机制

### 目标
1. 提供一键安装命令（Copy 按钮 → 一键粘贴执行）
2. 区分必装技能包和进阶技能包
3. 添加安装状态反馈
4. 优化页面结构，保持 KISS 原则

## 3. 方案设计

### 3.1 技能包分类

| 分类 | 描述 | 技能列表 |
|------|------|----------|
| 必装包 (Essential Pack) | 新小龙虾必备技能 | github, github-pr, read-github, claude-team, cursor-agent |
| 进阶包 (Advanced Pack) | 进阶技能 | discord, slack, cloudflare, kubectl-skill, supabase, vercel-react-best-practices, frontend-design, openai |
| 专家包 (Expert Pack) | 专家级技能 | conventional-commits, codex-monitor, agentlens, digital-ocean, hetzner-cloud, opencode-acp-control, ui-audit |

### 3.2 页面结构调整

移除复杂的分步安装指南，保留核心功能：

1. **Hero 区域** - 保留主标题和快速跳转
2. **技能包展示** - 三个技能包卡片（必装/进阶/专家）
3. **一键安装区** - 核心功能区，提供复制命令按钮

### 3.3 关键交互

1. 点击"一键安装"按钮 → 复制完整安装命令到剪贴板
2. 显示成功/失败状态反馈
3. 支持分包安装（可选）

## 4. 技术实现

### 4.1 数据结构

```typescript
interface SkillPack {
  id: string;
  name: string;
  description: string;
  skillIds: string[];
  icon: React.ElementType;
  color: string;
}
```

### 4.2 组件设计

- `SkillPackCard` - 技能包展示卡片
- `InstallCommand` - 安装命令展示和复制组件

### 4.3 文件变更

| 文件 | 变更 |
|------|------|
| `app/dojo/page.tsx` | 重构页面结构，提取组件 |
| `app/dojo/page.test.tsx` | 新增测试文件 |
| `components/dojo/skill-pack-card.tsx` | 新增技能包卡片组件 |
| `components/dojo/install-command.tsx` | 新增安装命令组件 |

## 5. 设计原则

- **KISS**: 保持简单，移除不必要的复杂性
- **高内聚**: 每个组件职责单一
- **低耦合**: 组件间通过 props 通信
- **可测试**: 所有新代码 100% 测试覆盖

## 6. 验收标准

- [ ] 页面正常渲染，无报错
- [ ] 复制命令功能正常
- [ ] 三个技能包正确展示
- [ ] 测试覆盖率达到 100%
- [ ] 不影响其他页面功能
