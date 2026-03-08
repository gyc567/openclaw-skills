# OpenSpec: Design Refresh - Tech/Financial Theme

## 1. Overview

**Project**: ClawSkillStore Marketplace  
**Type**: Design System Update  
**Goal**: Transform the visual identity to a tech-financial aesthetic with circuit patterns and digital elements

## 2. Problem Statement

Current design uses orange accent (#f97316) which doesn't convey the desired financial/tech professionalism. Need to evolve to a fluorescent cyan color scheme with circuit-inspired patterns.

## 3. Design Principles

- **KISS**: Minimal CSS changes, leverage existing Tailwind structure
- **High Cohesion**: All design tokens in one file (globals.css)
- **Low Coupling**: Components use token variables, not hardcoded values
- **No Regression**: All existing components continue working

## 4. Color Palette

### New Design Tokens

| Token | Current | New | Usage |
|-------|---------|-----|-------|
| `--background` | #000000 | #0a0f1a | Deep charcoal blue |
| `--foreground` | #ffffff | #e0f7fa | Light cyan white |
| `--card` | #111111 | #0d1525 | Darker card |
| `--accent` | #f97316 | #00e5ff | Fluorescent cyan |
| `--accent-glow` | - | #00e5ff | Glow effects |
| `--border` | #333333 | #1e3a5f | Blue-tinted border |
| `--secondary` | #1a1a1a | #132035 | Dark blue secondary |
| `--muted-foreground` | #888888 | #6b8ba3 | Muted cyan-gray |

## 5. Visual Effects

### Circuit Pattern
- Grid lines with subtle glow
- Intersection dots at grid crossings
- Animated pulse on key elements

### Digital Elements
- Scan line overlay (subtle)
- Numeric/data display styling
- Terminal-inspired typography
- Subtle gradient overlays

### Glow Effects
- Cyan glow on hover states
- Accent color pulse animations
- Border glow on active elements

## 6. Component Updates

### Phase 1: Design Tokens (globals.css)
- Update all color variables
- Add circuit pattern CSS
- Add glow effect classes
- Add animation keyframes

### Phase 2: Core Components
- `hero.tsx` - Add circuit background, update stats cards
- `navbar.tsx` - Cyan glow on scroll, updated brand
- `footer.tsx` - Subtle circuit pattern, glow accents

### Phase 3: UI Components
- `skill-card.tsx` - Glow border on hover
- `button.tsx` - Cyan glow variants
- `badge.tsx` - Glow accent

## 7. Implementation

### CSS Additions (globals.css)

```css
/* Circuit grid pattern */
.circuit-grid {
  background-image: 
    linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* Circuit dot */
.circuit-dot {
  position: relative;
}
.circuit-dot::before {
  content: '';
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--accent-glow);
  border-radius: 50%;
  opacity: 0.5;
}

/* Glow effects */
.glow-cyan {
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.3);
}
.glow-cyan-sm {
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.2);
}

/* Text glow */
.text-glow {
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
}
```

## 8. Verification

- [ ] All tests pass (62/62)
- [ ] Build succeeds
- [ ] TypeScript clean
- [ ] No broken functionality

## 9. Exclusions

- No changes to component logic
- No changes to data/functions
- No new dependencies
- Test files unchanged (visual only)
