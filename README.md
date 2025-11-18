# Family App

Private family collaboration platform for 4 members + 1 admin. Password-based authentication with real-time features.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **UI**: shadcn/ui + TailwindCSS
- **Forms**: React Hook Form + Zod
- **State**: TanStack Query + Zustand
- **Auth**: bcryptjs + JWT sessions

## Features

### MVP (Phase 1)
- ✅ Password-based authentication (5 members: 4 MEMBER + 1 ADMIN)
- ✅ Chat (polling-based, upgrade to WebSocket in Phase 2)
- ✅ Family board (posts + comments)
- ✅ Checklist (todo with assignee)
- ✅ Admin page (member management)

### Phase 2-4 (Future)
- Calendar with approval system
- Photo album
- Polls
- Personal notes
- WebSocket real-time chat

## Project Structure

```
family-app/
├── app/
│   ├── api/           # API routes
│   │   ├── auth/      # Login, logout, session
│   │   ├── chat/      # Chat messages
│   │   ├── posts/     # Board posts
│   │   ├── todos/     # Checklist
│   │   └── admin/     # Admin endpoints
│   ├── layout.tsx     # Root layout with Providers
│   └── page.tsx       # Home page
├── lib/
│   ├── auth/          # Authentication utilities
│   │   ├── password.ts   # bcrypt hashing
│   │   ├── jwt.ts        # JWT token management
│   │   ├── session.ts    # Session management
│   │   └── index.ts      # Exports
│   ├── db.ts          # Prisma client singleton
│   ├── validations/   # Zod schemas
│   ├── hooks/         # React hooks
│   └── stores/        # Zustand stores
├── components/
│   └── ui/            # shadcn components
├── prisma/
│   └── schema.prisma  # Database schema
└── docs/              # Documentation for Web Claude
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string (from Neon)
- `JWT_SECRET`: Secret key for JWT tokens (use a strong random string)
- `NEXT_PUBLIC_APP_URL`: App URL (http://localhost:3003 for local)

### 3. Setup database

Generate Prisma Client and push schema:

```bash
npm run db:generate
npm run db:push
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3003](http://localhost:3003)

## Database Commands

```bash
# Generate Prisma Client
npm run db:generate

# Push schema changes to database (no migration files)
npm run db:push

# Create migration (for production)
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio
```

## Authentication Flow

1. **Member Setup** (Admin only):
   - Admin creates family member with name + password
   - Password is hashed with bcryptjs (10 rounds)

2. **Login**:
   - Member enters name + password
   - System verifies hash
   - Creates JWT token (7 days expiry)
   - Stores session in database + httpOnly cookie

3. **Session Verification**:
   - Every request checks session cookie
   - Verifies JWT and database session
   - Returns member info if valid

4. **Logout**:
   - Deletes session from database
   - Clears session cookie

## API Patterns

### Protected Route Example

```typescript
// app/api/protected/route.ts
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    const member = await requireAuth()
    // member is authenticated
    return NextResponse.json({ data: 'protected' })
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
```

### Admin-Only Route Example

```typescript
// app/api/admin/route.ts
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'

export async function POST() {
  try {
    const admin = await requireAdmin()
    // admin is authenticated and has ADMIN role
    return NextResponse.json({ data: 'admin action' })
  } catch (error) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
}
```

## Development Workflow

### Terminal Claude (CTO)
- Local environment setup
- Database migrations
- Testing and debugging
- Repository management

### Web Claude
- Feature implementation
- API endpoint development
- Component creation
- Works in `feature/web-claude-mvp` branch
- Cannot access local environment or database

See `docs/WEB_CLAUDE_GUIDE.md` for detailed Web Claude workflow.

## Deployment

- **Frontend + API**: Vercel
- **Database**: Neon (PostgreSQL)

Environment variables must be set in Vercel dashboard.

## Security Notes

- Passwords are hashed with bcryptjs (10 rounds)
- Sessions use httpOnly cookies (XSS protection)
- JWT tokens expire after 7 days
- Database sessions are validated on every request
- CSRF protection via sameSite=lax cookies
- Use strong JWT_SECRET in production

## License

Private family project
