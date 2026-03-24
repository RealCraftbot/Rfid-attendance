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
npm run build                  # Production build (runs prisma generate first)
npm run start                  # Start production server

# Database
npm run db:generate           # Generate Prisma client
npm run db:push               # Push schema changes (development)
npm run db:migrate            # Run migrations (creates migration files)
npm run db:seed               # Seed database with test data

# Linting & Cache
npm run lint                   # Run ESLint
npm run clean                  # Clear Next.js cache (.next folder)

# Testing (when added)
npm test                       # Run all tests
npm test -- --testNamePattern="should validate RFID scan"  # Single test
npm test -- --watch            # Watch mode
```

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
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { attendanceService } from '@/services/attendance-service';
import { scanAttendanceSchema } from '@/lib/validation';
```

### TypeScript
- Enable `strict: true` in tsconfig (already configured)
- Use explicit return types on public functions
- Use `type` for simple shapes, `interface` for extensible objects
- Export types from validation schemas: `export type ScanInput = z.infer<typeof scanAttendanceSchema>`

### Formatting
- Use single quotes for strings
- No trailing semicolons (Next.js default)
- 2-space indentation
- Max line length: 100 characters

### Error Handling
- Use Zod `.strict()` or `.strip()` on schemas to prevent injection
- Try/catch at API route level, throw in services
- Never log sensitive data (passwords, tokens, RFID UIDs)
```typescript
try {
  const result = await attendanceService.scan(rfidUid, deviceId, orgId);
  return success(result);
} catch (error) {
  console.error('Scan failed:', error.message); // Safe to log
  return serverError('Failed to process scan');
}
```

---

## Architecture Standards

### Database (Prisma)
- Use singleton pattern: `import { prisma } from '@/lib/prisma'`
- Multi-tenancy: All tables (except User, Organization) have `orgId` foreign key
- Always scope queries to `orgId` for data isolation
```typescript
const students = await prisma.student.findMany({
  where: { orgId, isActive: true }
});
```

### Service Layer
- Business logic in `@/services/` files
- API routes are entry points only
- Never put business logic in route handlers

### API Routes
- Add `export const dynamic = 'force-dynamic';` to all API routes
- Use Zod `safeParse` for validation
- Use response helpers from `@/lib/api-response.ts`

### API Response Format
```typescript
// Success (200/201)
{ success: true, data: {...} }

// Error (400/401/403/429/500)
{ success: false, error: { code: string, message: string, details: any } }
```

### HTTP Status Codes
- 200/201: Success
- 400: Zod validation errors
- 401/403: Auth/permission failures
- 429: Rate limiting (device cooldown)
- 500: Server/database errors

---

## Security Best Practices

- Use bcrypt for passwords (10 salt rounds)
- Rate limit device endpoints (429 on duplicate scans)
- HMAC signatures for RFID device authentication
- Always scope queries to `orgId`
- Use transactions for multi-table operations

---

## Key Patterns

### RFID Scan Flow
1. Device POST to `/api/scanAttendance` with `X-Device-Token` header
2. Validate device token against Device table
3. Check idempotency (5s window) to prevent duplicates
4. Use `prisma.$transaction` for atomic operations:
   - Create AttendanceRecord
   - Update Student.currentStatus and lastSeen
   - Update Device.lastSeen and batteryLevel

### Creating New Features
1. Add model to `prisma/schema.prisma`
2. Run `npm run db:push`
3. Create service methods in `@/services/`
4. Create API route handlers
5. Add frontend components with proper loading states

---

## Project Structure

```
app/
├── api/                      # API routes
│   ├── auth/[...nextauth]/   # NextAuth handler
│   ├── attendance/           # Attendance CRUD
│   └── scanAttendance/       # RFID scan endpoint
├── dashboard/                # Dashboard pages
├── login/                    # Auth pages
└── (other routes)

lib/
├── prisma.ts                 # Prisma singleton
├── auth.ts                   # NextAuth config
├── validation.ts             # Zod schemas
└── api-response.ts           # Response helpers

services/
├── attendance-service.ts     # Business logic
└── notification-service.ts   # SMS/Email notifications (Termii + SMTP)

prisma/
└── schema.prisma             # Database schema
```

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_URL=https://...
NEXTAUTH_SECRET=...

# Termii SMS (Nigerian SMS Gateway)
# Get API key from: https://termii.com
TERMII_API_KEY=your-termii-api-key
TERMII_SENDER_ID=RFIDSCHOOL

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=RFID Attendance <noreply@yourdomain.com>

# Application
APP_URL=https://yourdomain.com
APP_NAME=RFID Attendance
```

## Key Enums
```prisma
enum Role { SUPER_ADMIN, ADMIN, TEACHER, PARENT }
enum CheckType { check_in, check_out }
enum BusStatus { WAITING, ON_BUS_TO_SCHOOL, AT_SCHOOL, ON_BUS_TO_HOME, HOME }
```
