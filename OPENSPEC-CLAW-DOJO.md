# OpenSpec: Claw Dojo Page

## 1. Overview

**Project**: ClawSkillStore Marketplace  
**Type**: New Feature  
**Goal**: Create "Claw Dojo" - a training ground for Open Cloud Agent robots to learn and install Skills

## 2. Problem Statement

New Open Cloud agents need a dedicated training page where they can:
- Discover all available Skills from beginner to advanced
- Learn step-by-step how to install Skills manually
- Use one-click installation for quick setup

## 3. Design Principles

- **KISS**: Simple, focused page with clear progression
- **High Cohesion**: All training-related content in one page
- **Low Coupling**: Independent page, minimal dependencies
- **Agent-Friendly**: Clear instructions agents can follow

## 4. UI/UX Specification

### Layout Structure
- **Hero Section**: Title, description, tagline
- **Training Paths**: Beginner, Intermediate, Advanced sections
- **Installation Guide**: Step-by-step manual guide
- **Quick Install**: One-click install section

### Visual Design
- Match existing tech-financial theme (cyan accents, dark background)
- Use circuit pattern background
- Glow effects on interactive elements

### Components
1. **Hero Banner**: "Claw Dojo - Agent Training Ground"
2. **Skill Levels**: 3 tiers (Beginner, Intermediate, Advanced)
3. **Manual Install Steps**: Numbered instructions
4. **Quick Install Button**: One-click install all

## 5. Implementation

### Files to Create
- `app/dojo/page.tsx` - Main dojo page

### Files to Update
- `components/navbar.tsx` - Add "Claw Dojo" menu item

## 6. Content Structure

### Hero
- Title: "Claw Dojo"
- Subtitle: "Open Cloud Agent 修炼道场"
- Description: Training ground for AI agents to learn and install Skills

### Skill Levels
- **Beginner**: Basic skills (5-10 essential skills)
- **Intermediate**: Workflow automation (15-20 skills)
- **Advanced**: Expert-level skills (20+ skills)

### Installation Options
1. **Manual Install**: Step-by-step guide with code blocks
2. **Quick Install**: One command to install all recommended skills

## 7. Verification

- [ ] All tests pass
- [ ] Build succeeds
- [ ] TypeScript clean
- [ ] Responsive on all devices
