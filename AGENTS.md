# Agent Coding Guidelines for AttendIQ

## Project Overview
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS 4
- **Auth**: NextAuth.js (credentials provider)
- **Testing**: Vitest
- **Validation**: Zod 4

## Build/Lint/Test Commands
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build (generates Prisma client first)
npm run build

# Lint all files
npm run lint

# Clean Next.js build cache
npm run clean

# Database commands
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:seed      # Seed test data
```

### Testing (`tests/` directory - separate package.json)
```bash
cd tests && npm run test                           # Run all tests
cd tests && npx vitest run security.test.ts        # Run single test file
cd tests && npx vitest run --grep "Password"       # Run tests matching pattern
cd tests && npm run test:ui                        # Run with UI
cd tests && npm run test:coverage                   # Run with coverage
```

## Code Style Guidelines

### TypeScript
- Strict mode: no implicit `any`, strict null checks
- Use `export type` for type-only exports
- Use Zod for runtime validation in `lib/validation.ts`

### Imports (order: external → internal → relative)
```typescript
import React from 'react';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { success, forbidden } from '@/lib/api-response';
import { cn } from '@/lib/utils';
```

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `Navbar.tsx` |
| Hooks | camelCase + `use` prefix | `useRBAC.ts` |
| API Routes | kebab-case | `/api/students/route.ts` |
| DB Models | PascalCase | `Organization` |
| Enums | SCREAMING_SNAKE | `Role.SUPER_ADMIN` |

### File Organization
```
app/api/      # API routes (kebab-case)
components/  # React components
lib/          # Utilities, Prisma, auth, validation
hooks/        # Custom hooks
services/     # Business logic
```

### API Routes Pattern
```typescript
// app/api/students/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, validationError, forbidden, serverError } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const schema = z.object({ name: z.string().min(2, 'Name required') });

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.orgId) return forbidden('Organization ID required');
    const students = await prisma.student.findMany({ where: { orgId: session.user.orgId } });
    return success(students);
  } catch (error) {
    console.error('[Students API Error]', error);
    return serverError('Failed to fetch students');
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);
    const student = await prisma.student.create({ data: parsed.data });
    return success(student, 201);
  } catch (error) {
    console.error('[Students API Error]', error);
    return serverError('Failed to create student');
  }
}
```

### Error Handling
Use response helpers from `@/lib/api-response`:
- `success(data, 200/201)` - Success | `validationError(parsed.error)` - Zod validation
- `unauthorized()` - 401 | `forbidden()` - 403 | `notFound('Entity')` - 404 | `serverError()` - 500

### Database (Prisma)
- Use `prisma` singleton from `@/lib/prisma`
- Use `select` when you don't need all fields
- Always filter by `orgId` for multi-tenant queries

### React Components
- Use `'use client'` only when needed (state, effects, event handlers)
- Use `motion/react` for animations (not framer-motion)
- Use `cn()` from `@/lib/utils` for conditional classes

### Security Guidelines
- Never commit secrets (use `.env`)
- Hash passwords with bcryptjs
- Validate all input with Zod
- Sanitize output with `sanitizeString()` from `lib/validation.ts`
- Audit log sensitive actions with `AuditLogger`

### Tailwind CSS Theme Colors
```
--color-brand-navy: #01012E
--color-brand-blue: #0143DF
--color-brand-green: #3FF29C
--color-brand-purple: #C6CCFF
--color-brand-lime: #DBE70C
```

## Role-Based Access Control
Roles: `SUPER_ADMIN`, `ADMIN`, `TEACHER`, `PARENT`, `BURSAR`

```typescript
// Server-side
const session = await getServerSession(authOptions);
if (session?.user?.role !== 'ADMIN') return forbidden('Admin access required');

// Client-side
const { role, isAdmin, canAccess } = useRBAC();
```

## Key Dependencies
`@prisma/client`, `next-auth`, `zod`, `motion`, `lucide-react`, `date-fns`, `recharts`