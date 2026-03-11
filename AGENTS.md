# AGENTS.md - Agentic Coding Guidelines

This file provides guidelines for AI agents operating in this repository.

## Project Overview

- **Type**: Next.js 16 + React 19 + TypeScript application
- **Purpose**: OpenCreditAi website - a skill registry for AI agents
- **Design**: Agent-style UI (black/white + orange accent, JetBrains Mono font)
- **Testing**: Vitest with @testing-library/react

---

## Commands

### Development
```bash
npm run dev          # Start dev server on localhost:3000
npm run build        # Production build
npm run start        # Start production server
```

### Testing
```bash
npm run test                    # Run all tests with coverage
npm run test:watch             # Run tests in watch mode
npm run test:ui                # Run tests with UI
npm run test -- path/to/test   # Run single test file
npm run test -t "test name"    # Run tests matching name pattern
```

### Linting
```bash
npm run lint         # Run ESLint
```

---

## Code Style Guidelines

### TypeScript

- **Strict mode enabled** in `tsconfig.json` - do not disable
- Use explicit types for function parameters and return types
- Avoid `any` - use `unknown` when type is truly unknown
- Use interface over type for object shapes
- Use `type` for unions, intersections, and primitives

```typescript
// Good
interface User {
  id: string;
  name: string;
}

function getUser(id: string): Promise<User | null>

// Avoid
function getUser(id: string): Promise<any>
```

### Imports

- Use path alias `@/*` for project imports (configured in tsconfig.json)
- Order imports: external libraries → internal imports → relative imports
- Use named exports for components and utilities

```typescript
// External
import { useState, useCallback } from "react";
import { motion } from "framer-motion";

// Internal (path alias)
import { Card, CardContent } from "@/components/ui/card";
import { Skill, categories } from "@/lib/skills-data";

// Relative
import { ErrorBoundary } from "./error/error-boundary";
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `SkillCard`, `Navbar` |
| Functions | camelCase | `getSkillsByCategory` |
| Variables | camelCase | `isLoading`, `skillList` |
| Constants | PascalCase | `Categories`, `ApiEndpoints` |
| Interfaces | PascalCase | `Skill`, `UserProfile` |
| Files (components) | kebab-case | `skill-card.tsx`, `navbar.tsx` |
| Files (utilities) | kebab-case | `utils.ts`, `error-handler.ts` |

### React Patterns

- Use `"use client"` directive for client components
- Memoize callbacks with `useCallback` when passed as props
- Memoize expensive computations with `useMemo`
- Use functional components exclusively
- Extract complex logic into custom hooks

```typescript
"use client";

import { useState, useCallback } from "react";

interface Props {
  skill: Skill;
}

export function SkillCard({ skill }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    // implementation
  }, [skill.id]);

  return <Card>...</Card>;
}
```

### Error Handling

- Use the centralized error handler utilities in `lib/error-handler.ts`
- Never suppress errors with empty catch blocks
- Always log errors in development mode
- Normalize errors before throwing

```typescript
import { normalizeError, safeExecute } from "@/lib/error-handler";

// Normalize before throwing
throw normalizeError(error);

// Safe execute with fallback
const result = safeExecute(() => riskyOperation(), defaultValue);
```

### Database

- Use the singleton pool pattern in `lib/db/client.ts`
- Never expose database credentials in client code
- Use parameterized queries to prevent SQL injection

```typescript
import { query, execute } from "@/lib/db/client";

// Parameterized query
const users = await query<User>("SELECT * FROM users WHERE id = $1", [userId]);
```

---

## Testing Guidelines

### Test File Location
- Tests colocated with components: `components/skill-card.test.tsx`
- Test libraries: `lib/skills-data.test.ts`

### Test Patterns
```typescript
import { render, screen } from "@testing-library/react";
import { SkillCard } from "./skill-card";
import { describe, it, expect } from "vitest";

const mockSkill = {
  id: "test-skill",
  name: "Test Skill",
  description: "A test skill",
  author: "Test Author",
  category: "development",
  tags: ["test"],
};

describe("SkillCard", () => {
  it("renders without crashing", () => {
    render(<SkillCard skill={mockSkill} />);
    expect(screen.getByText("Test Skill")).toBeInTheDocument();
  });
});
```

### Coverage Target
- Aim for 100% test coverage on components
- All component files should have corresponding `.test.tsx` files

---

## UI/Styling

### Design Tokens
CSS variables are defined in `app/globals.css`:

```css
:root {
  --background: #000000;
  --foreground: #ffffff;
  --card: #111111;
  --accent: #f97316;        /* Orange accent */
  --border: #333333;
  --muted: #1a1a1a;
}
```

### Tailwind CSS
- Uses Tailwind CSS v4 with `@theme` directive
- Utility classes preferred over custom CSS
- Use `cn()` utility for conditional classes

```typescript
import { cn } from "@/lib/utils";

<Card className={cn(
  "bg-card border-border",
  isActive && "border-accent"
)} />
```

### Component Structure
- Use Radix UI primitives for complex components
- Wrap interactive components with ErrorBoundary
- Use framer-motion for animations

---

## File Organization

```
app/                    # Next.js App Router
├── api/               # API routes
├── globals.css         # Design tokens
├── layout.tsx         # Root layout
└── page.tsx           # Home page

components/
├── ui/               # Radix UI primitives (Button, Card, Dialog...)
├── skill-card.tsx     # Feature components
└── skill-card.test.tsx

lib/
├── db/               # Database client
├── api/              # API utilities
├── skills-data.ts    # Data types and constants
├── utils.ts          # Shared utilities
└── error-handler.ts  # Error handling
```

---

## Quality Gates

Before submitting any changes:
1. `npm run lint` passes with no errors
2. `npm run test` passes with 100% coverage
3. `npm run build` succeeds without errors
4. TypeScript compiles without errors (`tsc --noEmit`)

---

## Common Patterns

### Client-Server Components
```typescript
// Client component
"use client";
export function ClientComponent() { ... }

// Server component (default)
export async function ServerComponent() { ... }
```

### Environment Variables
- Required in production: `DATABASE_URL`
- Optional in development
- Access via `process.env.VARIABLE_NAME`

### Conditional Rendering
```typescript
{condition && <Component />}
{condition ? <TrueComponent /> : <FalseComponent />}
```
