# Family App - MVP Project Specification

## Overview

Private family collaboration platform for 4 family members + 1 admin with password-based authentication. Built with Next.js 15 fullstack architecture using playbook patterns.

**Target Users**: 5 fixed family members (4 MEMBER + 1 ADMIN)
**Authentication**: Password-based (no email/username)
**MVP Timeline**: Phase 1 (4 core features)
**Future Phases**: Calendar, Album, Polls, Personal Notes

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **UI**: shadcn/ui + TailwindCSS
- **Forms**: React Hook Form + Zod
- **State Management**:
  - Server state: TanStack Query
  - Client state: Zustand (if needed)
- **Authentication**: bcryptjs + JWT + httpOnly cookies
- **Real-time**: Polling (Phase 1), WebSocket (Phase 2)

---

## Database Schema

### FamilyMember
```prisma
model FamilyMember {
  id        String   @id @default(cuid())
  name      String   @db.VarChar(100)
  role      Role     @default(MEMBER)
  codeHash  String   @unique @db.VarChar(255)  // bcrypt hash
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  sessions     Session[]
  chatMessages ChatMessage[]
  posts        Post[]
  comments     Comment[]
  todos        Todo[]
}

enum Role {
  MEMBER
  ADMIN
}
```

### Session
```prisma
model Session {
  id        String   @id @default(cuid())
  memberId  String
  token     String   @unique @db.VarChar(500)  // JWT token
  expiresAt DateTime
  createdAt DateTime @default(now())

  member FamilyMember @relation(fields: [memberId], references: [id], onDelete: Cascade)

  @@index([memberId])
  @@index([token])
}
```

### ChatRoom & ChatMessage
```prisma
model ChatRoom {
  id        String   @id @default(cuid())
  name      String   @db.VarChar(200)
  isDefault Boolean  @default(false)
  createdAt DateTime @default(now())

  messages ChatMessage[]
}

model ChatMessage {
  id        String   @id @default(cuid())
  roomId    String
  senderId  String
  content   String   @db.Text
  imageUrl  String?  @db.VarChar(500)
  createdAt DateTime @default(now())

  room   ChatRoom     @relation(fields: [roomId], references: [id], onDelete: Cascade)
  sender FamilyMember @relation(fields: [senderId], references: [id], onDelete: Cascade)

  @@index([roomId])
  @@index([senderId])
  @@index([createdAt])
}
```

### Post & Comment
```prisma
model Post {
  id        String   @id @default(cuid())
  authorId  String
  title     String   @db.VarChar(300)
  content   String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  author   FamilyMember @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments Comment[]

  @@index([authorId])
  @@index([createdAt])
}

model Comment {
  id        String   @id @default(cuid())
  postId    String
  authorId  String
  content   String   @db.Text
  createdAt DateTime @default(now())

  post   Post         @relation(fields: [postId], references: [id], onDelete: Cascade)
  author FamilyMember @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@index([postId])
  @@index([authorId])
}
```

### Todo
```prisma
model Todo {
  id          String   @id @default(cuid())
  title       String   @db.VarChar(300)
  description String?  @db.Text
  isDone      Boolean  @default(false)
  createdBy   String
  assignedTo  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  creator  FamilyMember  @relation(fields: [createdBy], references: [id], onDelete: Cascade)
  assignee FamilyMember? @relation(fields: [assignedTo], references: [id], onDelete: SetNull, name: "AssignedTodos")

  @@index([createdBy])
  @@index([assignedTo])
}
```

---

## MVP Features (Phase 1)

### 1. Authentication

#### User Flow
1. Login page with name + password fields
2. System verifies credentials
3. Creates session (JWT + database record)
4. Redirects to home page
5. Session persists for 7 days

#### API Endpoints

**POST /api/auth/login**
```typescript
// Request
{
  name: string
  password: string
}

// Response (200)
{
  member: {
    id: string
    name: string
    role: 'MEMBER' | 'ADMIN'
  }
}

// Response (401)
{
  error: 'Invalid credentials'
}
```

**POST /api/auth/logout**
```typescript
// Response (200)
{
  success: true
}
```

**GET /api/auth/session**
```typescript
// Response (200) - authenticated
{
  member: {
    id: string
    name: string
    role: 'MEMBER' | 'ADMIN'
  }
}

// Response (401) - not authenticated
{
  error: 'Unauthorized'
}
```

#### Zod Validation
```typescript
// lib/validations/auth.ts
import { z } from 'zod'

export const loginSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  password: z.string().min(4, 'Password must be at least 4 characters'),
})

export type LoginInput = z.infer<typeof loginSchema>
```

#### Components
- `components/auth/login-form.tsx` - Login form with React Hook Form
- `app/(auth)/login/page.tsx` - Login page

---

### 2. Chat (Polling-based)

#### User Flow
1. Default chat room is auto-created
2. Members can send text messages
3. Messages load via polling (every 3 seconds)
4. Messages display in chronological order with sender name
5. Auto-scroll to latest message

#### API Endpoints

**GET /api/chat/rooms**
```typescript
// Response (200)
{
  rooms: Array<{
    id: string
    name: string
    isDefault: boolean
    createdAt: string
  }>
}
```

**GET /api/chat/rooms/[roomId]/messages**
```typescript
// Query params: ?since=<timestamp> (optional)
// Response (200)
{
  messages: Array<{
    id: string
    content: string
    imageUrl: string | null
    createdAt: string
    sender: {
      id: string
      name: string
    }
  }>
}
```

**POST /api/chat/rooms/[roomId]/messages**
```typescript
// Request
{
  content: string
}

// Response (201)
{
  message: {
    id: string
    content: string
    createdAt: string
    sender: {
      id: string
      name: string
    }
  }
}
```

#### Zod Validation
```typescript
// lib/validations/chat.ts
import { z } from 'zod'

export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(5000),
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>
```

#### Components
- `components/chat/chat-room.tsx` - Main chat container
- `components/chat/message-list.tsx` - Message list with polling
- `components/chat/message-item.tsx` - Single message display
- `components/chat/message-input.tsx` - Input form

#### Polling Strategy
```typescript
// Use TanStack Query's refetchInterval
const { data: messages } = useQuery({
  queryKey: ['chat', roomId, 'messages'],
  queryFn: () => fetchMessages(roomId, lastMessageTime),
  refetchInterval: 3000, // Poll every 3 seconds
})
```

---

### 3. Family Board (Posts + Comments)

#### User Flow
1. Board displays all posts in reverse chronological order
2. Members can create new posts (title + content)
3. Members can edit/delete their own posts
4. Members can comment on any post
5. Comments display under each post

#### API Endpoints

**GET /api/posts**
```typescript
// Query params: ?limit=20&offset=0 (pagination)
// Response (200)
{
  posts: Array<{
    id: string
    title: string
    content: string
    createdAt: string
    updatedAt: string
    author: {
      id: string
      name: string
    }
    _count: {
      comments: number
    }
  }>
  total: number
}
```

**GET /api/posts/[postId]**
```typescript
// Response (200)
{
  post: {
    id: string
    title: string
    content: string
    createdAt: string
    updatedAt: string
    author: {
      id: string
      name: string
    }
    comments: Array<{
      id: string
      content: string
      createdAt: string
      author: {
        id: string
        name: string
      }
    }>
  }
}
```

**POST /api/posts**
```typescript
// Request
{
  title: string
  content: string
}

// Response (201)
{
  post: {
    id: string
    title: string
    content: string
    createdAt: string
    author: {
      id: string
      name: string
    }
  }
}
```

**PATCH /api/posts/[postId]**
```typescript
// Request
{
  title?: string
  content?: string
}

// Response (200)
{
  post: {
    id: string
    title: string
    content: string
    updatedAt: string
  }
}

// Response (403) - not author
{
  error: 'Forbidden'
}
```

**DELETE /api/posts/[postId]**
```typescript
// Response (200)
{
  success: true
}

// Response (403) - not author
{
  error: 'Forbidden'
}
```

**POST /api/posts/[postId]/comments**
```typescript
// Request
{
  content: string
}

// Response (201)
{
  comment: {
    id: string
    content: string
    createdAt: string
    author: {
      id: string
      name: string
    }
  }
}
```

#### Zod Validation
```typescript
// lib/validations/post.ts
import { z } from 'zod'

export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300),
  content: z.string().min(1, 'Content is required'),
})

export const updatePostSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  content: z.string().min(1).optional(),
})

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
})

export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
export type CreateCommentInput = z.infer<typeof createCommentSchema>
```

#### Components
- `components/posts/post-list.tsx` - List of all posts
- `components/posts/post-item.tsx` - Single post display
- `components/posts/post-form.tsx` - Create/edit post form
- `components/posts/comment-list.tsx` - Comments for a post
- `components/posts/comment-form.tsx` - Comment input

---

### 4. Checklist (Todos)

#### User Flow
1. All members see shared todo list
2. Members can create todos (title + optional description)
3. Members can assign todos to specific members
4. Members can mark todos as done/undone
5. Filter view: All | Assigned to me | Created by me

#### API Endpoints

**GET /api/todos**
```typescript
// Query params: ?filter=all|assignedToMe|createdByMe&isDone=true|false (optional)
// Response (200)
{
  todos: Array<{
    id: string
    title: string
    description: string | null
    isDone: boolean
    createdAt: string
    updatedAt: string
    creator: {
      id: string
      name: string
    }
    assignee: {
      id: string
      name: string
    } | null
  }>
}
```

**POST /api/todos**
```typescript
// Request
{
  title: string
  description?: string
  assignedTo?: string  // member ID
}

// Response (201)
{
  todo: {
    id: string
    title: string
    description: string | null
    isDone: false
    createdAt: string
    creator: {
      id: string
      name: string
    }
    assignee: {
      id: string
      name: string
    } | null
  }
}
```

**PATCH /api/todos/[todoId]**
```typescript
// Request
{
  title?: string
  description?: string
  isDone?: boolean
  assignedTo?: string | null
}

// Response (200)
{
  todo: {
    id: string
    title: string
    description: string | null
    isDone: boolean
    updatedAt: string
    assignee: {
      id: string
      name: string
    } | null
  }
}
```

**DELETE /api/todos/[todoId]**
```typescript
// Response (200)
{
  success: true
}

// Response (403) - not creator
{
  error: 'Only creator can delete todo'
}
```

#### Zod Validation
```typescript
// lib/validations/todo.ts
import { z } from 'zod'

export const createTodoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300),
  description: z.string().max(5000).optional(),
  assignedTo: z.string().cuid().optional(),
})

export const updateTodoSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().max(5000).optional(),
  isDone: z.boolean().optional(),
  assignedTo: z.string().cuid().nullable().optional(),
})

export type CreateTodoInput = z.infer<typeof createTodoSchema>
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>
```

#### Components
- `components/todos/todo-list.tsx` - List with filters
- `components/todos/todo-item.tsx` - Single todo display with checkbox
- `components/todos/todo-form.tsx` - Create/edit todo form
- `components/todos/todo-filters.tsx` - Filter buttons

---

### 5. Admin Page

#### User Flow (Admin only)
1. View all family members
2. Create new member (name + password)
3. Edit member password
4. Cannot delete members (data integrity)

#### API Endpoints

**GET /api/admin/members** (Admin only)
```typescript
// Response (200)
{
  members: Array<{
    id: string
    name: string
    role: 'MEMBER' | 'ADMIN'
    createdAt: string
  }>
}

// Response (403) - not admin
{
  error: 'Admin access required'
}
```

**POST /api/admin/members** (Admin only)
```typescript
// Request
{
  name: string
  password: string
  role: 'MEMBER' | 'ADMIN'
}

// Response (201)
{
  member: {
    id: string
    name: string
    role: 'MEMBER' | 'ADMIN'
    createdAt: string
  }
}

// Response (400) - name exists
{
  error: 'Member name already exists'
}
```

**PATCH /api/admin/members/[memberId]** (Admin only)
```typescript
// Request
{
  name?: string
  password?: string
}

// Response (200)
{
  member: {
    id: string
    name: string
    role: 'MEMBER' | 'ADMIN'
    updatedAt: string
  }
}
```

#### Zod Validation
```typescript
// lib/validations/admin.ts
import { z } from 'zod'

export const createMemberSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  role: z.enum(['MEMBER', 'ADMIN']),
})

export const updateMemberSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  password: z.string().min(4).optional(),
})

export type CreateMemberInput = z.infer<typeof createMemberSchema>
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>
```

#### Components
- `app/admin/page.tsx` - Admin dashboard (protected route)
- `components/admin/member-list.tsx` - List of all members
- `components/admin/member-form.tsx` - Create/edit member form

---

## Routing Structure

```
app/
├── (auth)/
│   └── login/
│       └── page.tsx          # Login page
├── (protected)/              # Authenticated routes
│   ├── layout.tsx            # Auth check wrapper
│   ├── page.tsx              # Home/Dashboard
│   ├── chat/
│   │   └── page.tsx          # Chat page
│   ├── board/
│   │   ├── page.tsx          # Post list
│   │   ├── [postId]/
│   │   │   └── page.tsx      # Post detail
│   │   └── new/
│   │       └── page.tsx      # Create post
│   ├── todos/
│   │   └── page.tsx          # Todo list
│   └── admin/
│       └── page.tsx          # Admin dashboard (admin only)
└── api/
    ├── auth/
    │   ├── login/route.ts
    │   ├── logout/route.ts
    │   └── session/route.ts
    ├── chat/
    │   └── rooms/
    │       ├── route.ts
    │       └── [roomId]/
    │           └── messages/route.ts
    ├── posts/
    │   ├── route.ts
    │   └── [postId]/
    │       ├── route.ts
    │       └── comments/route.ts
    ├── todos/
    │   ├── route.ts
    │   └── [todoId]/route.ts
    └── admin/
        └── members/
            ├── route.ts
            └── [memberId]/route.ts
```

---

## TanStack Query Patterns

### Example: Fetch Posts
```typescript
// lib/hooks/use-posts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const res = await fetch('/api/posts')
      if (!res.ok) throw new Error('Failed to fetch posts')
      return res.json()
    },
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreatePostInput) => {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create post')
      return res.json()
    },
    onSuccess: () => {
      // Invalidate and refetch posts list
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}
```

---

## Error Handling

### API Response Format
```typescript
// Success
{
  data: T
}

// Error
{
  error: string
  code?: string
}
```

### Error Boundaries
Use Next.js error boundaries for each route group:

```typescript
// app/(protected)/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

---

## Security Checklist

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ Sessions use httpOnly cookies (XSS protection)
- ✅ JWT tokens expire after 7 days
- ✅ Database sessions validated on every request
- ✅ CSRF protection via sameSite=lax
- ✅ Authorization checks in API routes (requireAuth, requireAdmin)
- ✅ Input validation with Zod on all endpoints
- ✅ No sensitive data in client-side code

---

## Testing Strategy

### Unit Tests (Optional for MVP)
- Authentication utilities
- Validation schemas

### Integration Tests (Future)
- API endpoints with database
- Authentication flow

### E2E Tests (Future)
- Login → Chat flow
- Create post → Comment flow

---

## Deployment

### Vercel (Frontend + API)
1. Connect GitHub repository
2. Set environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_APP_URL`
3. Deploy `main` branch

### Neon (Database)
1. Create PostgreSQL instance
2. Copy connection string to `DATABASE_URL`
3. Run `npm run db:push` to create tables

---

## Phase 2+ Features (Future)

### Calendar with Approval
- Members create events
- Admin approves/rejects
- CalendarEvent model + EventStatus enum

### Photo Album
- Album + Photo models
- Image upload to cloud storage
- Gallery view

### Polls
- Poll + PollOption + PollVote models
- One vote per member
- Results visualization

### Personal Notes
- PersonalNote model
- Private to each member
- Markdown support

### WebSocket Chat
- Replace polling with Socket.IO
- Instant message delivery
- Typing indicators

---

## Performance Optimization

### MVP (Not Required)
- Basic polling (3 second interval)
- Server-side rendering for posts
- TanStack Query caching

### Phase 2+ (Future)
- WebSocket for real-time chat
- Image optimization with next/image
- Pagination for posts/todos
- Infinite scroll with TanStack Query

---

## Accessibility

- Semantic HTML
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus states on all inputs/buttons

---

## Browser Support

- Chrome (latest)
- Safari (latest)
- Firefox (latest)
- Edge (latest)

---

## License

Private family project
