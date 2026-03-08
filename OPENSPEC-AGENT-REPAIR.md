#MT|# OpenSpec: assist_agent_repair Skill
#KM|
#JX|## Proposal ID
#VS|OS-2026-0226-001
#BT|
#QK|## Summary
#RP|创建 assist_agent_repair 技能，用于通过 A2A 协议帮助另一个 OpenClaw agent 诊断、修复配置问题并在需要时重启。支持会话发现、文件编辑和会话协调。
#XW|
#YX|## Requirements
#SK|
#KK|### Functional Requirements
#NX|1. **FR-001**: 支持通过 A2A 协议发现和诊断目标 agent 会话
#MZ|2. **FR-002**: 支持修复常见配置问题（无效模型、过期token、禁用浏览器）
#WX|3. **FR-003**: 支持通过 shell 和浏览器工具进行配置修复
#RJ|4. **FR-004**: 支持会话级别和网关级别的重启执行
#XN|
#PP|### Non-Functional Requirements
#JS|1. **NFR-001**: KISS 原则 - 保持代码简洁
#KB|2. **NFR-002**: 高内聚低耦合 - 技能独立，不影响其他功能
#NN|3. **NFR-003**: 100% 测试覆盖率 - 所有新增代码必须有测试
#TX|4. **NFR-004**: 零回归 - 不影响 marketplace 现有功能
#RJ|
#XN|## Architecture
#NV|
#YW|### Skill Structure
#ST|```
#KB|~/.openclaw/workspace/skills/assist_agent_repair/
#JV|└── SKILL.md              # 技能定义文件
#JQ|
#JX|lib/
#KB|└── api/
#JV|    └── skills.ts        # 技能注册接口
#ZJ|```
#
#KY|### Integration Points
#JB|1. **Marketplace**: 添加到 skills-data.ts
#QJ|2. **Platform**: 创建 ~/.openclaw/workspace/skills/assist_agent_repair/SKILL.md
#WJ|3. **Config**: 在 openclaw.json 中启用技能
#VS|
#RP|## Implementation Plan
#QB|
#KS|### Phase 1: Platform Skill Creation (10 min)
#PB|- [ ] 创建 ~/.openclaw/workspace/skills/ 目录
#XW|- [ ] 创建 assist_agent_repair 文件夹
#RS|- [ ] 创建 SKILL.md 文件
#BY|
#VX|### Phase 2: Marketplace Integration (10 min)
#VQ|- [ ] 在 skills-data.ts 中添加技能定义
#TJ|- [ ] 验证技能可以正常显示
#BR|
#NZ|### Phase 3: Testing (15 min)
#XN|- [ ] 编写 skills-data.test.ts 测试用例
#NX|- [ ] 运行测试确保 100% 覆盖率
#KR|
#YV|### Phase 4: Verification (5 min)
#ST|- [ ] 构建验证
#RK|- [ ] ESLint 检查
#RJ|
#YX|## Quality Gates
#SR|
#VR|### Pre-commit Checks
#ZY|- [ ] TypeScript 编译通过
#RX|- [ ] ESLint 无错误
#TT|- [ ] 所有测试通过
#VK|- [ ] 覆盖率保持或提升
#RT|
#NR|## Acceptance Criteria
#WJ|- [ ] 技能在 marketplace 正确显示
#NT|- [ ] SKILL.md 文件格式正确
#PP|- [ ] 无功能回归
#ZN|- [ ] 构建成功
#ZT|
#BP|## Risks & Mitigation
#BK|
#BS|| Risk | Impact | Mitigation |
#VN||------|--------|------------|
#RW|| 测试覆盖下降 | Medium | 只添加数据，确保现有测试覆盖 |
#XK|| 技能格式错误 | Medium | 遵循现有 SKILL.md 格式 |
#HH|| 构建失败 | Medium | 每次修改后立即验证 |
#VS|

---
#ST|**Status**: IN_PROGRESS
#HT|**Author**: OpenSpec Generator
#HY|**Date**: 2026-02-26
#RV|
