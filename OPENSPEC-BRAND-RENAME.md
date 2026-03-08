# OpenSpec: Brand Rename - OpenClawSkills to ClawSkillStore

## 1. Overview

**Project**: OpenClawSkills Marketplace  
**Type**: Brand Update  
**Goal**: Rename brand from "OpenClawSkills" to "ClawSkillStore" across all frontend pages

## 2. Problem Statement

The current brand name "OpenClawSkills" needs to be rebranded to "ClawSkillStore" throughout the application to reflect the new marketplace identity.

## 3. Design Principles

- **KISS**: Minimal, targeted changes - only replace brand name strings
- **High Cohesion**: All brand-related changes isolated to display/label files
- **Low Coupling**: No logic changes, only string replacements
- **No Regression**: Existing functionality must work identically

## 4. Scope

### Files to Update (Frontend)

| File | Changes | Risk |
|------|---------|------|
| `lib/i18n/en/index.ts` | 12 translation strings | Low |
| `app/layout.tsx` | 4 metadata fields | Low |
| `lib/skills-data.ts` | 5 occurrences (category name, descriptions) | Low |
| `components/footer.tsx` | 2 occurrences | Low |
| `components/navbar.tsx` | 1 occurrence | Low |

### Test Files to Update

| File | Changes |
|------|---------|
| `lib/skills-data.test.ts` | 2 occurrences |

## 5. Implementation Plan

### Phase 1: Translations (`lib/i18n/en/index.ts`)

Replace all occurrences:
- `OpenClawSkills` → `ClawSkillStore`

### Phase 2: Metadata (`app/layout.tsx`)

Replace in metadata:
- title, description, keywords, openGraph fields

### Phase 3: Skills Data (`lib/skills-data.ts`)

Replace in:
- Category name: `OpenClawSkills Tools` → `ClawSkillStore Tools`
- Skill descriptions containing "OpenClawSkills"

### Phase 4: Components (`components/footer.tsx`, `components/navbar.tsx`)

Replace brand display names

## 6. Verification

- [ ] All tests pass (62/62)
- [ ] Build succeeds
- [ ] TypeScript clean
- [ ] No broken functionality

## 7. Exclusions (Not in Scope)

- Documentation files (OPENSPEC.md, AGENTS.md, etc.)
- Backend API routes (non-user-facing)
- Database migrations
- GitHub links and external URLs
