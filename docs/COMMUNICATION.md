# Terminal Claude ↔ Web Claude Communication

> This file is the **single source of truth** for task assignments, progress tracking, and communication between Terminal Claude (CTO) and Web Claude (Developer).

---

## Current Sprint: MVP Phase 1

**Goal**: Implement 4 core features - Auth, Chat, Board, Checklist + Admin page

**Branch**: `feature/web-claude-mvp`

**Status**: ⏳ Environment setup complete, ready for feature implementation

---

## Active Task

**Task ID**: SETUP-001
**Assigned To**: Terminal Claude
**Status**: ✅ Completed
**Title**: Basement infrastructure setup

**Details**:
- ✅ Next.js 15 project initialized
- ✅ Playbook stack installed (shadcn/ui, Zod, React Hook Form, TanStack Query, Zustand)
- ✅ Authentication packages installed (bcryptjs, jsonwebtoken, dotenv)
- ✅ Prisma schema created with MVP models
- ✅ Folder structure created (app/api, lib, components)
- ✅ Prisma environment configured (dotenv, db.ts, providers)
- ✅ Authentication utilities written (password, jwt, session)
- ✅ .env.example and README.md created
- ✅ Documentation created (PROJECT_SPEC.md, WEB_CLAUDE_GUIDE.md)

**Next Steps**:
- Get DATABASE_URL from user
- Push schema to Neon database
- Create GitHub repository
- Assign first feature task to Web Claude

---

## Upcoming Tasks (Prioritized)

### AUTH-001: Authentication System
**Priority**: 🔴 High
**Assigned To**: TBD (Web Claude)
**Estimated Effort**: Medium

**Scope**:
- Login page with form
- Login/logout/session API endpoints
- Protected route layout
- Session check middleware

**Files to Create**:
- `app/(auth)/login/page.tsx`
- `app/(auth)/layout.tsx`
- `app/api/auth/login/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/auth/session/route.ts`
- `components/auth/login-form.tsx`
- `lib/validations/auth.ts`
- `app/(protected)/layout.tsx`

**Acceptance Criteria**:
- [ ] Login form validates with Zod
- [ ] Invalid credentials show error message
- [ ] Valid credentials create session and redirect to home
- [ ] Logout clears session and redirects to login
- [ ] Protected routes redirect to login if not authenticated
- [ ] Session persists across page refreshes

---

### CHAT-001: Chat Room & Messages
**Priority**: 🔴 High
**Assigned To**: TBD
**Estimated Effort**: Large

**Scope**:
- Chat page with message list (polling)
- Send message form
- Auto-scroll to latest message
- Chat API endpoints

**Files to Create**:
- `app/(protected)/chat/page.tsx`
- `app/api/chat/rooms/route.ts`
- `app/api/chat/rooms/[roomId]/messages/route.ts`
- `components/chat/chat-room.tsx`
- `components/chat/message-list.tsx`
- `components/chat/message-item.tsx`
- `components/chat/message-input.tsx`
- `lib/validations/chat.ts`
- `lib/hooks/use-chat.ts`

**Acceptance Criteria**:
- [ ] Messages load and display in chronological order
- [ ] New messages appear via polling (3 second interval)
- [ ] Send message form works and adds message instantly
- [ ] Messages show sender name and timestamp
- [ ] Auto-scrolls to bottom when new messages arrive
- [ ] Empty state shows when no messages

---

### BOARD-001: Family Board (Posts)
**Priority**: 🟡 Medium
**Assigned To**: TBD
**Estimated Effort**: Large

**Scope**:
- Post list page
- Post detail page
- Create/edit post forms
- Post and comment API endpoints

**Files to Create**:
- `app/(protected)/board/page.tsx`
- `app/(protected)/board/[postId]/page.tsx`
- `app/(protected)/board/new/page.tsx`
- `app/api/posts/route.ts`
- `app/api/posts/[postId]/route.ts`
- `app/api/posts/[postId]/comments/route.ts`
- `components/posts/post-list.tsx`
- `components/posts/post-item.tsx`
- `components/posts/post-form.tsx`
- `components/posts/comment-list.tsx`
- `components/posts/comment-form.tsx`
- `lib/validations/post.ts`
- `lib/hooks/use-posts.ts`

**Acceptance Criteria**:
- [ ] Posts display in reverse chronological order
- [ ] Can create new post with title and content
- [ ] Can edit own posts
- [ ] Can delete own posts
- [ ] Can comment on any post
- [ ] Comments display under posts
- [ ] Post shows comment count

---

### TODO-001: Checklist (Todos)
**Priority**: 🟡 Medium
**Assigned To**: TBD
**Estimated Effort**: Medium

**Scope**:
- Todo list page with filters
- Create/edit todo forms
- Toggle todo done status
- Assign todo to member

**Files to Create**:
- `app/(protected)/todos/page.tsx`
- `app/api/todos/route.ts`
- `app/api/todos/[todoId]/route.ts`
- `components/todos/todo-list.tsx`
- `components/todos/todo-item.tsx`
- `components/todos/todo-form.tsx`
- `components/todos/todo-filters.tsx`
- `lib/validations/todo.ts`
- `lib/hooks/use-todos.ts`

**Acceptance Criteria**:
- [ ] Todos display with title, description, assignee
- [ ] Can create new todo with optional assignee
- [ ] Can toggle todo done/undone with checkbox
- [ ] Can filter: All | Assigned to me | Created by me
- [ ] Can delete own todos
- [ ] Done todos show visual indicator (strikethrough or checkmark)

---

### ADMIN-001: Admin Dashboard
**Priority**: 🟢 Low
**Assigned To**: TBD
**Estimated Effort**: Medium

**Scope**:
- Admin page (protected, admin-only)
- Member list display
- Create/edit member forms
- Admin API endpoints

**Files to Create**:
- `app/(protected)/admin/page.tsx`
- `app/api/admin/members/route.ts`
- `app/api/admin/members/[memberId]/route.ts`
- `components/admin/member-list.tsx`
- `components/admin/member-form.tsx`
- `lib/validations/admin.ts`
- `lib/hooks/use-admin.ts`

**Acceptance Criteria**:
- [ ] Only admin can access admin page
- [ ] Displays list of all family members
- [ ] Can create new member with name + password + role
- [ ] Can edit member name and password
- [ ] Shows member creation date
- [ ] Password is hidden/masked in edit form

---

## Task History

### ✅ [2025-01-18] SETUP-001: Basement Infrastructure
**Completed By**: Terminal Claude
**Duration**: Initial setup session

**Work Done**:
- Initialized Next.js 15 project with TypeScript
- Installed playbook stack packages
- Created complete Prisma schema (MVP + future phases commented)
- Set up authentication utilities (bcrypt, JWT, session management)
- Configured Prisma Client singleton and TanStack Query providers
- Created comprehensive documentation for Web Claude
- Prepared folder structure

**Files Created**:
- `prisma/schema.prisma`
- `prisma.config.ts`
- `lib/db.ts`
- `lib/auth/password.ts`
- `lib/auth/jwt.ts`
- `lib/auth/session.ts`
- `lib/auth/index.ts`
- `app/providers.tsx`
- `.env.example`
- `README.md`
- `docs/PROJECT_SPEC.md`
- `docs/WEB_CLAUDE_GUIDE.md`
- `docs/COMMUNICATION.md`

**Notes**:
- All basement infrastructure is ready
- Waiting for DATABASE_URL to push schema
- GitHub repository creation pending

---

## Questions & Blockers

### Open Questions

None currently.

### Blockers

**BLOCKER-001**: Need DATABASE_URL for family-app
**Status**: ⏳ Waiting
**Assigned To**: User
**Details**: Require PostgreSQL connection string from Neon to initialize database

**Resolution Path**:
1. User provides DATABASE_URL
2. Terminal Claude creates .env file
3. Terminal Claude runs `npm run db:generate` and `npm run db:push`
4. Terminal Claude creates GitHub repository
5. Terminal Claude assigns AUTH-001 to Web Claude

---

## Development Notes

### Environment Status
- ✅ Local project initialized
- ✅ Dependencies installed
- ✅ Prisma schema ready
- ⏳ Database connection pending (waiting for DATABASE_URL)
- ⏳ GitHub repository pending

### Tech Decisions
- **Architecture**: Next.js fullstack (Hybrid approach - can migrate to Express later)
- **Chat Strategy**: Polling for MVP, WebSocket for Phase 2
- **Authentication**: bcryptjs + JWT + httpOnly cookies
- **Port**: 3003 (second-brain-app uses 3004)

### Next Session Goals
1. Get DATABASE_URL and connect database
2. Create GitHub repository (family-app)
3. Commit and push initial setup
4. Assign AUTH-001 to Web Claude in `feature/web-claude-mvp` branch

---

## Communication Guidelines

### For Terminal Claude
- Update "Active Task" section when working
- Move completed tasks to "Task History"
- Assign new tasks with clear acceptance criteria
- Answer Web Claude's questions in "Questions & Blockers"

### For Web Claude
- Check "Active Task" for current assignment
- Update status as you progress
- List all files created/modified
- Document any blockers or questions
- Mark task complete when done + request Terminal Claude review

### Status Indicators
- ⏳ In Progress
- ✅ Completed
- ❌ Blocked
- 🔴 High Priority
- 🟡 Medium Priority
- 🟢 Low Priority

---

## MVP Completion Checklist

### Phase 1 Core Features
- [ ] AUTH-001: Authentication system
- [ ] CHAT-001: Chat with polling
- [ ] BOARD-001: Family board (posts + comments)
- [ ] TODO-001: Checklist (todos)
- [ ] ADMIN-001: Admin dashboard

### Quality Gates
- [ ] All TypeScript errors resolved
- [ ] All Zod validations implemented
- [ ] Error handling in all API routes
- [ ] Protected routes working correctly
- [ ] Session management tested
- [ ] UI responsive on mobile/desktop
- [ ] README.md updated with setup instructions

### Deployment
- [ ] Environment variables set in Vercel
- [ ] Database schema pushed to Neon
- [ ] Vercel deployment successful
- [ ] Production testing complete

---

**Last Updated**: 2025-01-18 by Terminal Claude
