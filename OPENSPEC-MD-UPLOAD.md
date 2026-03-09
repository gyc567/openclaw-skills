# OpenSpec: MD File Upload for Listing Creation

## Metadata
- **ID**: OS-2026-0309-001
- **Created**: 2026-03-09
- **Author**: Development Team
- **Priority**: High
- **Status**: Proposed

---

## Problem Statement

Users need an easier way to create listings by uploading a pre-written `.md` file instead of manually filling out the form. This is especially useful for developers who prefer writing documentation in Markdown format.

---

## Goals

1. Allow users to upload `.md` files on the listing creation page
2. Parse the uploaded file and auto-fill the form fields
3. Support standard YAML frontmatter format
4. Provide clear error messages for invalid files

---

## Technical Design

### Frontmatter Format (Expected)

```markdown
---
name: My Awesome Skill
description: This skill does amazing things for AI agents
category: finance
tags:
  - trading
  - ai
  - automation
priceUsd: 9.99
version: 1.0.0
packageUrl: https://github.com/user/skill-repo
---

# Rest of the markdown content goes to description
```

### File Structure

```
components/seller/
├── listing-form.tsx      # Add file upload handler
└── md-parser.ts          # NEW: Parse MD frontmatter
```

### Implementation

1. **MD Parser (`md-parser.ts`)**:
   - Extract YAML frontmatter from MD file
   - Parse frontmatter into ListingFormData interface
   - Extract body content as fallback description

2. **Listing Form Updates**:
   - Add file input for .md upload
   - On file select, parse and auto-fill form
   - Show upload button with icon

---

## Acceptance Criteria

| Criteria | Description |
|----------|-------------|
| File Upload | User can click to upload a .md file |
| Auto-fill | Form fields populate from frontmatter |
| Error Handling | Invalid files show clear error messages |
| KISS | Simple, clean implementation |
| No Regression | Existing form functionality works unchanged |

---

## Timeline

- Implementation: 1 hour
- Testing: 30 minutes
- Deployment: 5 minutes
