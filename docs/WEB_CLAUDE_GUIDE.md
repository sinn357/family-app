# Web Claude Development Guide - Family App

> This guide is for **Web Claude** (claude.ai interface) working on the Family App MVP.

---

## Your Role

You are **Web Claude**, working in collaboration with **Terminal Claude** (the CTO) to build the Family App MVP. Your strength is feature implementation, while Terminal Claude handles local environment, database, and infrastructure.

---

## What You CAN Do

### ✅ Allowed
- Read all files in the GitHub repository
- Create new components, API routes, hooks, utilities
- Edit existing code files
- Write Zod validation schemas
- Create TanStack Query hooks
- Implement UI with shadcn/ui components
- Write TypeScript types and interfaces
- Create page layouts and routing
- Implement authentication logic (using provided utilities)
- Write documentation and comments

### ❌ Cannot Do
- Run local development server (`npm run dev`)
- Access local database or run Prisma commands
- Execute bash commands or scripts
- Test code in browser
- Debug runtime errors
- Install new npm packages (ask Terminal Claude)
- Modify `package.json` dependencies
- Push schema changes to database

---

## Development Workflow

### 1. Branch Strategy

**Your Working Branch**: `feature/web-claude-mvp`

```
main (protected)
  └── feature/web-claude-mvp (your branch)
```

**Rules**:
- NEVER commit directly to `main`
- All work goes into `feature/web-claude-mvp`
- Terminal Claude will test and merge to `main`

### 2. Task Assignment

Terminal Claude will assign tasks in `docs/COMMUNICATION.md`:

```markdown
## Current Task

**Task**: Implement login page and API
**Status**: Assigned
**Details**:
- Create login form component
- Implement /api/auth/login endpoint
- Add form validation with Zod

**Files to Create/Edit**:
- `app/(auth)/login/page.tsx`
- `app/api/auth/login/route.ts`
- `components/auth/login-form.tsx`
- `lib/validations/auth.ts`
```

### 3. Your Implementation Flow

1. **Read the task** in `docs/COMMUNICATION.md`
2. **Check PROJECT_SPEC.md** for API specs and requirements
3. **Implement** the features:
   - Create necessary files
   - Write clean, typed TypeScript code
   - Follow coding patterns (see below)
   - Add error handling
4. **Update COMMUNICATION.md** with:
   - Files created/modified
   - Implementation notes
   - Any questions or blockers
   - Mark task as "Completed" when done

### 4. Handoff to Terminal Claude

When task is complete:
1. Update `docs/COMMUNICATION.md` status to "Completed"
2. List all modified files
3. Note any testing requirements
4. Mention any new dependencies needed

Terminal Claude will:
- Pull your code
- Test locally
- Run type checking
- Fix any runtime issues
- Merge to `main` when approved

---

## Coding Patterns

### API Route Structure

```typescript
// app/api/[feature]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { createPostSchema } from '@/lib/validations/post'

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const member = await requireAuth()

    // 2. Parse and validate body
    const body = await request.json()
    const validated = createPostSchema.parse(body)

    // 3. Database operation
    const post = await prisma.post.create({
      data: {
        title: validated.title,
        content: validated.content,
        authorId: member.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // 4. Return success
    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    // 5. Error handling
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Component with Form

```typescript
// components/posts/post-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createPostSchema, type CreatePostInput } from '@/lib/validations/post'
import { useCreatePost } from '@/lib/hooks/use-posts'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function PostForm() {
  const createPost = useCreatePost()

  const form = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  })

  async function onSubmit(data: CreatePostInput) {
    try {
      await createPost.mutateAsync(data)
      form.reset()
      // Success feedback
    } catch (error) {
      // Error feedback
      console.error(error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Post title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea placeholder="Write your post..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={createPost.isPending}>
          {createPost.isPending ? 'Creating...' : 'Create Post'}
        </Button>
      </form>
    </Form>
  )
}
```

### TanStack Query Hook

```typescript
// lib/hooks/use-posts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreatePostInput } from '@/lib/validations/post'

export function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const res = await fetch('/api/posts')
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to fetch posts')
      }
      return res.json()
    },
  })
}

export function usePost(postId: string) {
  return useQuery({
    queryKey: ['posts', postId],
    queryFn: async () => {
      const res = await fetch(`/api/posts/${postId}`)
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to fetch post')
      }
      return res.json()
    },
    enabled: !!postId,
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
        credentials: 'include', // Important for cookies
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create post')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postId: string) => {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete post')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}
```

### Protected Page

```typescript
// app/(protected)/board/page.tsx
import { redirect } from 'next/navigation'
import { getCurrentMember } from '@/lib/auth'
import { PostList } from '@/components/posts/post-list'

export default async function BoardPage() {
  const member = await getCurrentMember()

  if (!member) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Family Board</h1>
      <PostList />
    </div>
  )
}
```

### Admin-Only Page

```typescript
// app/(protected)/admin/page.tsx
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { MemberList } from '@/components/admin/member-list'

export default async function AdminPage() {
  try {
    const admin = await requireAdmin()
  } catch {
    redirect('/')
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <MemberList />
    </div>
  )
}
```

---

## Available Utilities

### Authentication (`lib/auth/`)

```typescript
import {
  hashPassword,        // Hash password with bcrypt
  verifyPassword,      // Verify password against hash
  createToken,         // Create JWT token
  verifyToken,         // Verify JWT token
  createSession,       // Create session in DB + cookie
  getSession,          // Get current session from cookie
  deleteSession,       // Delete session
  getCurrentMember,    // Get current authenticated member
  requireAuth,         // Require auth (throws if not authenticated)
  requireAdmin,        // Require admin role (throws if not admin)
} from '@/lib/auth'
```

### Database (`lib/db.ts`)

```typescript
import { prisma } from '@/lib/db'

// Example usage in API route:
const posts = await prisma.post.findMany({
  include: {
    author: {
      select: {
        id: true,
        name: true,
      },
    },
    _count: {
      select: {
        comments: true,
      },
    },
  },
  orderBy: {
    createdAt: 'desc',
  },
})
```

---

## File Organization

### Create New Validation Schema

```typescript
// lib/validations/[feature].ts
import { z } from 'zod'

export const createSomethingSchema = z.object({
  field: z.string().min(1, 'Error message'),
})

export type CreateSomethingInput = z.infer<typeof createSomethingSchema>
```

### Create New Hook

```typescript
// lib/hooks/use-[feature].ts
import { useQuery, useMutation } from '@tanstack/react-query'

export function useSomething() {
  return useQuery({ ... })
}
```

### Create New Component

```typescript
// components/[feature]/[component-name].tsx
'use client' // If using hooks

export function ComponentName() {
  return <div>...</div>
}
```

---

## Common Patterns

### Polling (Chat Messages)

```typescript
// components/chat/message-list.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

export function MessageList({ roomId }: { roomId: string }) {
  const { data } = useQuery({
    queryKey: ['chat', roomId, 'messages'],
    queryFn: async () => {
      const res = await fetch(`/api/chat/rooms/${roomId}/messages`)
      if (!res.ok) throw new Error('Failed to fetch messages')
      return res.json()
    },
    refetchInterval: 3000, // Poll every 3 seconds
  })

  // Auto-scroll to bottom
  const bottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [data?.messages])

  return (
    <div className="space-y-2">
      {data?.messages.map((msg) => (
        <div key={msg.id}>
          <strong>{msg.sender.name}:</strong> {msg.content}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
```

### Optimistic Updates

```typescript
export function useToggleTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ todoId, isDone }: { todoId: string; isDone: boolean }) => {
      const res = await fetch(`/api/todos/${todoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDone }),
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to update todo')
      return res.json()
    },
    onMutate: async ({ todoId, isDone }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['todos'] })

      // Snapshot previous value
      const previous = queryClient.getQueryData(['todos'])

      // Optimistically update
      queryClient.setQueryData(['todos'], (old: any) => ({
        ...old,
        todos: old.todos.map((todo: any) =>
          todo.id === todoId ? { ...todo, isDone } : todo
        ),
      }))

      return { previous }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(['todos'], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}
```

---

## Error Handling

### API Route Errors

```typescript
export async function POST(request: NextRequest) {
  try {
    const member = await requireAuth()
    // ... logic
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Component Error Handling

```typescript
export function PostForm() {
  const createPost = useCreatePost()
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(data: CreatePostInput) {
    try {
      setError(null)
      await createPost.mutateAsync(data)
      // Success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post')
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded">
          {error}
        </div>
      )}
      {/* form fields */}
    </form>
  )
}
```

---

## TypeScript Types

### API Response Types

```typescript
// types/api.ts
export interface ApiResponse<T> {
  data?: T
  error?: string
}

export interface Post {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
  }
  _count?: {
    comments: number
  }
}

export interface Todo {
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
}
```

---

## Communication Protocol

### Update `docs/COMMUNICATION.md` After Each Task

```markdown
## Task History

### [2025-01-18] Login Implementation
**Status**: ✅ Completed

**Files Created**:
- `app/(auth)/login/page.tsx`
- `app/api/auth/login/route.ts`
- `components/auth/login-form.tsx`
- `lib/validations/auth.ts`

**Notes**:
- Implemented login form with React Hook Form + Zod
- Created login API endpoint with session creation
- Added error handling for invalid credentials
- Form validates on submit

**Testing Required**:
- Test login with valid credentials
- Test login with invalid credentials
- Verify session cookie is set
- Check redirect after successful login

**Blockers**: None
```

---

## Testing Notes

Since you can't run tests locally:

1. **Write testable code**:
   - Pure functions where possible
   - Clear separation of concerns
   - Type-safe with TypeScript

2. **Document test cases** in COMMUNICATION.md:
   ```markdown
   **Test Cases**:
   - [ ] Login with valid credentials → should redirect to /
   - [ ] Login with invalid name → should show error
   - [ ] Login with invalid password → should show error
   - [ ] Logout → should clear session and redirect to /login
   ```

3. **Terminal Claude will test** using local environment

---

## Best Practices

### DO
- ✅ Use TypeScript strict mode
- ✅ Validate all inputs with Zod
- ✅ Use shadcn/ui components for consistent UI
- ✅ Follow Next.js App Router conventions
- ✅ Add error handling to all API routes
- ✅ Use TanStack Query for server state
- ✅ Include TypeScript types for all functions
- ✅ Use async/await instead of .then()
- ✅ Add comments for complex logic
- ✅ Keep components small and focused

### DON'T
- ❌ Don't use `any` type
- ❌ Don't skip validation
- ❌ Don't hardcode values (use env vars or constants)
- ❌ Don't ignore errors (always handle them)
- ❌ Don't create huge components (split them)
- ❌ Don't forget to invalidate queries after mutations
- ❌ Don't use inline styles (use Tailwind classes)
- ❌ Don't commit `.env` file (use `.env.example`)

---

## Quick Reference

### Fetch with Credentials (Important!)

Always include `credentials: 'include'` for API calls:

```typescript
fetch('/api/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
  credentials: 'include', // ← Required for session cookies!
})
```

### Prisma Query Examples

```typescript
// Find unique
const member = await prisma.familyMember.findUnique({
  where: { id: memberId },
})

// Find many with filter
const todos = await prisma.todo.findMany({
  where: { assignedTo: memberId },
  include: {
    creator: true,
    assignee: true,
  },
  orderBy: { createdAt: 'desc' },
})

// Create
const post = await prisma.post.create({
  data: {
    title: 'Title',
    content: 'Content',
    authorId: memberId,
  },
})

// Update
const todo = await prisma.todo.update({
  where: { id: todoId },
  data: { isDone: true },
})

// Delete
await prisma.post.delete({
  where: { id: postId },
})
```

---

## Questions or Issues?

Update `docs/COMMUNICATION.md` with:

```markdown
## Questions / Blockers

**Question**: How should we handle file uploads for future photo album feature?

**Blocker**: Need new npm package `@tanstack/react-query-devtools` - can Terminal Claude install?
```

Terminal Claude will respond in the same file.

---

## Summary

1. **Work in `feature/web-claude-mvp` branch**
2. **Follow PROJECT_SPEC.md** for requirements
3. **Use provided patterns** for consistency
4. **Update COMMUNICATION.md** after each task
5. **Write type-safe, validated code**
6. **Document test cases** for Terminal Claude

You focus on **implementation**, Terminal Claude handles **testing & deployment**.

Good luck! 🚀
