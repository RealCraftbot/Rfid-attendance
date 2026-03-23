# AGENTS.md - RFID Attendance SaaS

## Project Overview
- **Framework:** Next.js 15 (App Router) with TypeScript
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** NextAuth.js v4
- **Styling:** Tailwind CSS v4
- **Validation:** Zod v4
- **Deployment:** Railway (Docker)

---

## Build & Development Commands

```bash
# Development
npm run dev                    # Start dev server (http://localhost:3000)
npm run build                  # Build for production (runs prisma generate first)
npm run start                  # Start production server

# Database
npm run db:generate           # Generate Prisma client
npm run db:push               # Push schema changes (development)
npm run db:migrate            # Run migrations (creates migration files)
npm run db:seed               # Seed database with test data

# Linting & Cache
npm run lint                   # Run ESLint
npm run clean                  # Clear Next.js cache (.next folder)
```

---

## Architecture Standards

### Database (Prisma)
- Use PostgreSQL with Prisma ORM
- Prisma client singleton pattern in `@/lib/prisma.ts`
- Multi-tenancy: All tables (except User, Organization) have `orgId` foreign key
- All queries MUST be scoped to `orgId` for data isolation

### Service Layer Pattern
- Business logic resides in `@/services/` (e.g., `attendance-service.ts`)
- API routes are entry points that call service methods
- Never put business logic directly in API route handlers

### Type Safety
- Use Zod v4 for all request body validation
- Use `.strict()` or `.strip()` on schemas to prevent parameter injection
- Use `z.infer` to export TypeScript types from schemas

---

## Code Style Guidelines

### Naming Conventions
```
Files:       kebab-case (e.g., attendance-service.ts)
Components:  PascalCase (e.g., DashboardClient.tsx)
Functions:   camelCase (e.g., processScan, validateDeviceToken)
Constants:   UPPER_SNAKE_CASE (e.g., IDEMPOTENCY_WINDOW_MS)
Types/Enums: PascalCase (e.g., CheckType, Role)
```

### Imports
- Use absolute path alias `@/` for all imports
- Group imports: external → internal → relative
```typescript
import { prisma } from '@/lib/prisma';
import { attendanceService } from '@/services/attendance-service';
import { success, error, serverError } from '@/lib/api-response';
import { scanAttendanceSchema } from '@/lib/validation';
```

### API Routes
- Add `export const dynamic = 'force-dynamic';` to all API routes
- Use response helpers from `@/lib/api-response.ts`
- Use Zod schemas with `safeParse` for validation

### API Response Format
```typescript
// Success
{ success: true, data: {...} }

// Error
{ success: false, error: { code: string, message: string, details: any } }
```

### HTTP Status Codes
- 200/201: Success
- 400: Zod Validation errors
- 401/403: Auth/Permission failures
- 429: Rate limiting (device cooldown)
- 500: Server/Database errors

---

## Project Structure

```
app/
├── api/
│   ├── auth/[...nextauth]/   # NextAuth handler
│   ├── attendance/           # Attendance CRUD
│   ├── scanAttendance/        # RFID device scan endpoint
│   └── ...
├── dashboard/               # Dashboard pages (Server Components)
├── login/                   # Auth pages
└── super-admin/             # Admin pages

lib/
├── prisma.ts               # Prisma singleton client
├── auth.ts                 # NextAuth config
├── auth-context.tsx        # Auth context provider
├── api-response.ts         # Response helpers
├── validation.ts           # Zod schemas
└── utils.ts                # Utilities (cn for Tailwind)

services/
└── attendance-service.ts   # Core scan logic with idempotency

prisma/
└── schema.prisma           # Database schema
```

---

## Database Schema (Prisma)

### Core Models
- **Organization** - Multi-tenant container
- **User** - Admins, Teachers (role-based)
- **Student** - Students with RFID UID
- **Device** - RFID scanners (ESP32)
- **AttendanceRecord** - Check-in/out logs
- **Classroom** - School classrooms

### Key Enums
```prisma
enum Role { SUPER_ADMIN, ADMIN, TEACHER, PARENT }
enum CheckType { check_in, check_out }
enum SubscriptionStatus { TRIAL, ACTIVE, INACTIVE, SUSPENDED }
```

---

## Environment Variables

```env
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://...
NEXTAUTH_SECRET=...
```

---

## Key Patterns

### RFID Scan Flow
1. Device sends POST to `/api/scanAttendance` with `X-Device-Token` header
2. Validate device token against Device table
3. Check idempotency (5s window) to prevent duplicate scans
4. Use `prisma.$transaction` for atomic operations:
   - Create AttendanceRecord
   - Update Student.currentStatus and lastSeen
   - Update Device.lastSeen and batteryLevel

### Creating a New API Route
1. Create `app/api/[resource]/route.ts`
2. Add validation schema to `@/lib/validation.ts`
3. Add response helpers from `@/lib/api-response.ts`
4. Implement handler with try/catch and proper error handling

### Adding a New Model
1. Add to `prisma/schema.prisma`
2. Run `npm run db:push` or `npm run db:migrate`
3. Create service methods in `@/services/`
4. Create API route handlers
5. Add frontend components

---

## Security Best Practices

- Never log sensitive data (passwords, tokens)
- Use bcrypt for password hashing (10 salt rounds)
- Rate limit device endpoints (429 on duplicate scans)
- HMAC signatures for RFID device authentication
- Zod `.strict()` to prevent parameter injection
- Always scope queries to `orgId` for multi-tenancy
