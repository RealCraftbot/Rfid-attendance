# Agent Guidelines for RFID Attendance System

This document provides guidelines for agentic coding agents working on this Next.js RFID attendance system.

## Build, Lint, and Test Commands

### Development
```bash
npm run dev          # Start development server
npm run clean        # Clean Next.js cache
```

### Build and Deploy
```bash
npm run build        # Build application (includes Prisma generation)
npm run start        # Start production server
```

### Code Quality
```bash
npm run lint         # Run ESLint on all files
```

### Database Operations
```bash
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes to database
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with test data
```

### Testing
**Note:** This project currently lacks a formal testing setup. When adding tests:
- Use Jest or Vitest for unit testing
- Use React Testing Library for component testing
- Place tests in `__tests__` directories adjacent to source files
- To run a single test, use `npm run test -- <test-file-path>` or `npx vitest <test-file-path>`
- To run tests in watch mode, use `npm run test:watch` or `npx vitest --watch`

## Code Style Guidelines

### Import Order and Organization
```typescript
// External libraries first
import React from 'react';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Internal libraries
import { prisma } from '@/lib/prisma';
import { success, validationError } from '@/lib/api-response';

// Relative imports
import { scanAttendanceSchema } from '@/lib/validation';
```

### File Naming Conventions
- **Components**: PascalCase (`DashboardClient.tsx`, `Navbar.tsx`)
- **API Routes**: lowercase (`route.ts`)
- **Utility files**: camelCase (`utils.ts`, `api-response.ts`)
- **Configuration**: kebab-case (`next.config.ts`, `eslint.config.mjs`)
- **Tests**: `*.test.ts` or `*.spec.ts` with descriptive names

### Component Structure
```typescript
'use client'; // Only for client components

import React from 'react';
import { motion } from 'motion/react';

interface ComponentProps {
  orgId: string;
  orgName: string;
  initialData: DashboardData;
}

export default function ComponentName({ orgId, orgName, initialData }: ComponentProps) {
  // Component logic here
  
  return (
    <div className="space-y-6">
      {/* JSX content */}
    </div>
  );
}
```

### API Route Structure
```typescript
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { success, validationError } from '@/lib/api-response';

const requestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);
    
    if (!parsed.success) {
      return validationError(parsed.error);
    }
    
    // Business logic here
    
    return success({ message: 'Operation completed' });
  } catch (error) {
    console.error('[API Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### TypeScript Conventions
- Use strict TypeScript configuration
- Prefer `interface` over `type` for object definitions
- Use Zod for runtime validation
- Export types from validation schemas

```typescript
// Good: Export types from validation
import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

export type UserInput = z.infer<typeof userSchema>;
```

### Error Handling Pattern
```typescript
// Use centralized error responses
import { success, badRequest, serverError } from '@/lib/api-response';

try {
  // Operation
  return success(result);
} catch (error) {
  console.error('[Operation Error]', error);
  return serverError('Failed to complete operation');
}
```

### Database Operations
- Use Prisma client from `@/lib/prisma`
- Always handle unique constraint errors
- Use transactions for multiple operations

```typescript
import { prisma } from '@/lib/prisma';

const user = await prisma.user.create({
  data: { email, name },
});
```

### Styling with Tailwind CSS
- Use utility-first approach
- Prefer Tailwind classes over custom CSS
- Use `cn` utility for conditional classes

```typescript
import { cn } from '@/lib/utils';

const className = cn(
  'bg-white p-6 rounded-xl',
  isActive && 'border-blue-500 border-2'
);
```

### State Management
- Use SWR for data fetching
- Prefer local state for UI state
- Use React hooks appropriately

```typescript
import useSWR from 'swr';

const { data, error } = useSWR(`/api/data?id=${orgId}`, fetcher, {
  refreshInterval: 10000,
  fallbackData: initialData,
});
```

### File Structure Patterns
- **API Routes**: `app/api/[route]/route.ts`
- **Pages**: `app/[page]/page.tsx`
- **Components**: `components/ComponentName.tsx`
- **Libraries**: `lib/library-name.ts`
- **Services**: `services/service-name.ts`
- **Tests**: `__tests__/[filename].test.ts`

### Authentication Patterns
- Use NextAuth.js for authentication
- Check roles using session data
- Protect routes with middleware

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const session = await getServerSession(authOptions);
if (!session || session.user.role !== 'ADMIN') {
  return forbidden('Access denied');
}
```

### Environment Variables
- Use `.env` for environment-specific configuration
- Access via `process.env.VARIABLE_NAME`
- Validate environment variables at startup

### Code Quality Standards
- Run `npm run lint` before committing
- Follow ESLint configuration
- Use Prettier for consistent formatting
- Write descriptive commit messages

## Project-Specific Conventions

### RFID-Specific Patterns
- Use `rfid_uid` for RFID card identifiers
- Validate device authentication headers
- Handle idempotency for attendance scans

### Attendance System Patterns
- Use `CheckType` enum for attendance types
- Track `scanTime` with proper timezone handling
- Implement real-time updates with SWR

### Payment System Patterns
- Use `PaymentStatus` enum for invoice tracking
- Implement approval workflows for payments
- Handle multiple payment methods

## Important Notes

- This is a Next.js 15 application with App Router
- Uses Prisma ORM with PostgreSQL
- Implements Tailwind CSS for styling
- Uses NextAuth.js for authentication
- No formal testing setup exists yet
- Follow existing patterns when adding new features
- Use `npm run test -- <test-file-path>` to run a single test
- Use `npx vitest <test-file-path>` to run a single test
- Use `npm run test:watch` or `npx vitest --watch` to run tests in watch mode