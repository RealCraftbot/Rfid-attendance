# AGENTS.md - RFID Attendance SaaS

## Project Overview
- **Framework:** Next.js 15 (App Router) with TypeScript
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** NextAuth.js v4
- **Styling:** Tailwind CSS v4
- **Validation:** Zod v4

---

## Build & Development Commands

```bash
# Development
npm run dev                    # Start dev server (http://localhost:3000)
npm run build                  # Build for production (runs prisma generate first)
npm run start                  # Start production server

# Database
npm run db:generate            # Generate Prisma client
npm run db:push                # Push schema changes (development)
npm run db:migrate             # Run migrations (creates migration files)
npm run db:migrate:prod        # Apply migrations in production
npm run db:seed                # Seed database with test data
npm run db:studio              # Open Prisma Studio (GUI)

# Linting & Type Checking
npm run lint                   # Run ESLint
npm run clean                  # Clear Next.js cache (.next folder)
```

---

## Code Style Guidelines

### TypeScript
- Use strict TypeScript mode (enabled in tsconfig.json)
- Avoid `any` type; use proper types or `unknown` when necessary
- Use Zod schemas for all API input validation (see `/lib/api/validation.ts`)
- Export types/interfaces for reusable schemas

### Naming Conventions
```
Files:       kebab-case (e.g., student-service.ts, attendance-utils.ts)
Components: PascalCase (e.g., StudentCard.tsx, DashboardLayout.tsx)
Functions:   camelCase (e.g., getStudentById, sendNotification)
Constants:   UPPER_SNAKE_CASE (e.g., MAX_RETRY_COUNT, API_TIMEOUT)
Types/Enums: PascalCase (e.g., UserRole, AttendanceStatus)
```

### Imports
- Use absolute path alias `@/` for all imports
- Group imports: external → internal → relative
- Use named exports preferred over default exports
```typescript
// Good
import { prisma } from '@/lib/prisma';
import { success, error } from '@/lib/api/response';
import { studentCreateSchema } from '@/lib/api/validation';

// Avoid
import prisma from '@/lib/prisma';
```

### API Routes
- Add `export const dynamic = 'force-dynamic';` to all API routes
- Use the response helpers from `@/lib/api/response`:
```typescript
import { success, error, serverError, validationError } from '@/lib/api/response';

// Always use safeParse for Zod validation
const parsed = schema.safeParse(body);
if (!parsed.success) {
  return validationError(parsed.error.issues);
}
```
- Log errors with context: `console.error('Students GET Error:', err);`
- Return consistent response format using helpers

### Error Handling
```typescript
// API Routes pattern
try {
  // ... logic
  return success({ data });
} catch (err) {
  console.error('Context:', err);
  return serverError();
}

// Check auth with early return
const session = await requireAuth();
if (session instanceof NextResponse) {
  return session;
}
```

### Database (Prisma)
- Use Prisma client singleton from `@/lib/prisma`
- Use transactions for multi-step operations
- Include relations only when needed (avoid over-fetching)
- Use `findFirst` with unique constraints

### React Components
- Use `'use client'` directive for client components
- Keep components small and focused
- Use `use client` boundaries wisely to optimize server rendering
- Use React Server Components by default, add interactivity only where needed

### Security
- Never log sensitive data (passwords, tokens)
- Validate all user input with Zod schemas
- Use `bcrypt` for password hashing (10 salt rounds)
- Rate limit API endpoints via middleware
- Use HMAC signatures for RFID device authentication

---

## Project Structure

```
app/
├── api/              # API routes (server-side)
│   ├── [resource]/   # CRUD routes (route.ts)
│   └── auth/         # NextAuth handler
├── dashboard/        # Authenticated pages
├── login/            # Public auth pages
└── super-admin/      # Admin pages

lib/
├── api/              # API utilities
│   ├── auth.ts       # Auth helpers (requireAuth, requireRole)
│   ├── response.ts   # Response helpers (success, error, serverError)
│   └── validation.ts # Zod schemas
├── services/         # Business logic
│   ├── notification.ts
│   └── otp.ts
├── auth.ts           # NextAuth config
├── prisma.ts         # Prisma client singleton
└── utils.ts          # Utilities (cn for Tailwind)

components/           # Reusable UI components
prisma/
├── schema.prisma     # Database schema
└── seed.ts           # Seed script
```

---

## Environment Variables

Required for production:
```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://...
NEXTAUTH_SECRET=...
TERMII_API_KEY=...     # SMS (optional)
SMTP_*=...            # Email (optional)
```

---

## Deployment

- **Platform:** Railway (Docker)
- **Build:** `npm run build` (Dockerfile included)
- **Start:** `npm start`

---

## Key Patterns

### Creating a New API Route
1. Create `app/api/[resource]/route.ts`
2. Add `export const dynamic = 'force-dynamic';`
3. Import response helpers and Zod schema
4. Implement CRUD handlers with validation

### Adding a New Model
1. Add to `prisma/schema.prisma`
2. Run `npm run db:push`
3. Create API route handlers
4. Add Zod validation schema
5. Create frontend components

### Authentication Flow
1. User submits credentials to NextAuth
2. `authorize()` in `lib/auth.ts` validates and returns user
3. JWT contains user data (id, role, orgId)
4. Middleware protects routes
5. Use `requireAuth()` or `requireRole()` in API routes
