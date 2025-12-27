# Next Session Guide

> **For**: Next Claude Code session
> **Date**: After 2024-12-27
> **Current State**: Design system V2 completed, all core features working

---

## 🚀 Quick Start

### Session Initialization

```
"README.md와 CLAUDE.md 읽고 시작해줘"
```

Claude will automatically:
- ✅ Read project structure
- ✅ Load workflow protocols
- ✅ Understand Vibe CLI usage

### Context Loading

Read these files to understand current state:
1. `docs/DESIGN_SYSTEM_V2.md` - Complete design system
2. `docs/SESSION_SUMMARY_2024-12-27.md` - What was done
3. `DEVELOPMENT_PROGRESS.md` - Full project history

---

## 📋 Current State

### Completed Features (2024-12-27 Session)

#### Design System ✅
- Rose (#F43F5E) + Brown (#B45309) color palette
- Glassmorphism with backdrop blur
- Gradient buttons and badges
- Micro-animations (200-300ms)
- Dark mode support

#### Pages Redesigned ✅
- Home: Time-based greetings, icon cards
- Chat: Bubble UI with avatars
- Board: Instagram-style cards
- Todos: Enhanced cards with avatars
- Login: Modern gradient design
- **Photos**: New Instagram grid + Lightbox (NEW!)

#### Navigation ✅
- Desktop: Bubbly pills with emoji icons (🏡💬📌✅🌸...)
- Mobile: Floating bottom nav with gradient active state

#### New Features ✅
- **Chat Message Deletion**: Soft delete with "삭제된 메시지" display
- **Photo Album**: Upload, grid, lightbox, delete
- **Emoji Navigation**: Cute icons throughout

### Tech Stack

```json
{
  "framework": "Next.js 15",
  "database": "PostgreSQL (Neon)",
  "orm": "Prisma",
  "ui": "shadcn/ui + TailwindCSS",
  "state": "TanStack Query + Zustand",
  "auth": "JWT + bcryptjs",
  "animations": "framer-motion"
}
```

### Database Schema

**Current Models:**
- FamilyMember (users)
- Session (auth)
- ChatRoom, ChatMessage (with isDeleted)
- Post, Comment (board)
- Todo (tasks)
- **Album, Photo** (NEW!)
- File (uploads)
- CalendarEvent
- Notification, NotificationSetting

---

## 🎯 Suggested Next Tasks

### Priority 1: Testing & Polish

1. **Mobile Testing**
   ```
   - Test floating bottom nav on real device
   - Verify touch interactions
   - Check photo upload on mobile
   - Test lightbox gestures
   ```

2. **Feature Testing**
   ```
   - Upload large photos (5MB+)
   - Test keyboard navigation in lightbox
   - Verify message deletion updates
   - Test deleted message display
   ```

3. **Performance**
   ```
   - Add image lazy loading
   - Optimize photo thumbnails
   - Virtual scrolling for long lists
   - Code splitting for routes
   ```

### Priority 2: UX Enhancements

1. **Animations**
   ```typescript
   // Confetti on photo upload
   import confetti from 'canvas-confetti'

   // Page transitions
   import { motion } from 'framer-motion'

   // Ripple effect on buttons
   ```

2. **Loading States**
   ```typescript
   // Skeleton loaders
   <PhotoCardSkeleton />

   // Optimistic updates
   useMutation({ onMutate: optimisticUpdate })

   // Suspense boundaries
   <Suspense fallback={<Skeleton />}>
   ```

3. **Error Handling**
   ```typescript
   // Error boundaries
   <ErrorBoundary fallback={<ErrorPage />}>

   // Toast enhancements
   toast.error('Upload failed', {
     action: { label: 'Retry', onClick: retry }
   })
   ```

### Priority 3: Feature Extensions

1. **Photo Features**
   ```
   [ ] Album folders (organize photos)
   [ ] Photo reactions (❤️👍😂)
   [ ] Comments on photos
   [ ] Download button
   [ ] Slideshow mode
   [ ] Share photo links
   ```

2. **Chat Features**
   ```
   [ ] Edit messages (5min window)
   [ ] Reply to message (thread)
   [ ] Message reactions (emoji)
   [ ] Voice messages
   [ ] Read receipts (✓✓)
   [ ] Typing indicator improvements
   ```

3. **Board Features**
   ```
   [ ] Post reactions
   [ ] Pin important posts
   [ ] Categories/tags
   [ ] Search posts
   [ ] Draft posts
   ```

4. **General Features**
   ```
   [ ] Command palette (Cmd+K)
   [ ] Global search
   [ ] Notification center
   [ ] User settings page
   [ ] Dark mode toggle
   [ ] Export data
   ```

---

## 🔧 Common Commands

### Development

```bash
# Start dev server (port 3003)
npm run dev

# Database operations
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes
npm run db:studio    # Open Prisma Studio

# Build & Test
npm run build
npm run lint
```

### Vibe CLI

```bash
# Project info
vibe info family-app

# All projects status
vibe status

# Database info
vibe db-info family-app
```

### Git

```bash
# Status
git status

# Commit (use HEREDOC for message)
git add .
git commit -m "$(cat <<'EOF'
feat: Description

Details...

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"

# Push
git push
```

---

## 🐛 Common Issues & Solutions

### Issue: Prisma Client Not Updated

```bash
# Solution
npm run db:generate
```

### Issue: Database Schema Out of Sync

```bash
# Solution
npm run db:push
# Warning: This may cause data loss in development
```

### Issue: Port 3003 Already in Use

```bash
# Solution
lsof -ti:3003 | xargs kill -9
npm run dev
```

### Issue: Image Upload Failing

Check:
1. ImageUpload component implementation
2. Upload endpoint (`/api/upload`)
3. File size limits
4. Image hosting service

---

## 📁 Key File Locations

### Design System
```
app/globals.css                    # Color palette & CSS variables
components/ui/button.tsx           # Button component
components/ui/card.tsx             # Card component
components/ui/input.tsx            # Input component
components/ui/badge.tsx            # Badge component
```

### Pages
```
app/(protected)/home/page.tsx      # Home dashboard
app/(protected)/chat/page.tsx      # Chat page
app/(protected)/board/page.tsx     # Board page
app/(protected)/todos/page.tsx     # Todos page
app/(protected)/photos/page.tsx    # Photos page (NEW!)
app/(auth)/login/page.tsx          # Login page
```

### Navigation
```
components/auth/protected-nav.tsx         # Desktop nav
components/auth/floating-bottom-nav.tsx   # Mobile nav (NEW!)
```

### Photos
```
components/photos/photo-grid.tsx      # Photo grid
components/photos/photo-card.tsx      # Individual photo card
components/photos/photo-lightbox.tsx  # Lightbox modal
components/photos/photo-upload.tsx    # Upload form
lib/hooks/use-photos.ts               # React Query hooks
```

### API Routes
```
app/api/photos/route.ts                    # POST, GET photos
app/api/photos/[photoId]/route.ts          # DELETE photo
app/api/chat/messages/[messageId]/route.ts # DELETE message
```

---

## 🎨 Design System Quick Reference

### Colors

```tsx
// Usage in JSX
className="bg-primary text-primary-foreground"
className="bg-accent text-accent-foreground"
className="bg-success text-success-foreground"
```

### Gradients

```tsx
// Button gradient
className="bg-gradient-to-br from-primary to-primary/90"

// Text gradient
className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"

// Background gradient
className="bg-gradient-to-br from-background via-background to-primary/5"
```

### Shadows

```tsx
// Color-tinted shadow
className="shadow-md shadow-primary/20"
className="hover:shadow-lg hover:shadow-primary/30"
```

### Animations

```tsx
// Hover lift
className="hover:-translate-y-0.5"

// Hover scale
className="hover:scale-105"

// Active scale
className="active:scale-[0.98]"

// Bounce (emoji)
className="hover:animate-bounce"
```

### Glassmorphism

```tsx
// Card
className="bg-card/80 backdrop-blur-md border border-border/50"

// Nav
className="bg-card/80 backdrop-blur-xl"
```

---

## 💡 Development Tips

### 1. Adding New Pages

Follow this pattern:
```tsx
// app/(protected)/newpage/page.tsx
export default function NewPage() {
  return (
    <div className="container mx-auto py-6 md:py-10 px-4 md:px-6">
      {/* Header with icon */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Page Title
          </h1>
          <p className="text-muted-foreground">Description</p>
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6">
        {/* ... */}
      </div>
    </div>
  )
}
```

### 2. Adding API Routes

```typescript
// app/api/resource/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const member = await requireAuth()
  const data = await db.resource.findMany({
    where: { userId: member.id }
  })
  return NextResponse.json({ data })
}
```

### 3. Using React Query

```typescript
// lib/hooks/use-resource.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useResource() {
  return useQuery({
    queryKey: ['resource'],
    queryFn: async () => {
      const res = await fetch('/api/resource')
      return res.json()
    },
  })
}

export function useCreateResource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data) => {
      const res = await fetch('/api/resource', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource'] })
    },
  })
}
```

---

## 🚨 Important Notes

### Database Safety

⚠️ **NEVER use these commands:**
```bash
prisma migrate reset --force       # Deletes all data
prisma db push --force-reset       # Deletes all data
```

✅ **Use instead:**
```bash
npm run db:push                    # Safe schema sync
npm run db:generate                # Update client
```

### Git Workflow

1. Always check what's changed: `git status`
2. Use descriptive commit messages
3. Include Claude co-author in commits
4. Push after major features complete

### Code Style

- Use TypeScript for type safety
- Follow existing naming conventions
- Keep components small and focused
- Use shadcn/ui components when possible
- Prefer composition over props drilling

---

## 📞 Getting Help

### If Stuck

1. **Check Documentation**
   - DESIGN_SYSTEM_V2.md
   - SESSION_SUMMARY.md
   - README.md

2. **Check Examples**
   - Look at existing pages
   - Copy patterns from similar features

3. **Ask User**
   - Use AskUserQuestion tool
   - Clarify requirements
   - Confirm approach

---

## ✅ Pre-Session Checklist

Before starting new work:
- [ ] Read CLAUDE.md
- [ ] Read README.md
- [ ] Read this NEXT_SESSION_GUIDE.md
- [ ] Read SESSION_SUMMARY (latest)
- [ ] Understand current features
- [ ] Check git status
- [ ] Review open tasks

---

## 🎯 Session Goals Template

When starting a session, establish clear goals:

```markdown
## Session Goals

1. [Main objective]
2. [Secondary objective]
3. [Nice-to-have]

## Success Criteria

- [ ] Feature X works
- [ ] Tests pass
- [ ] Documentation updated
- [ ] Code committed & pushed
```

---

**Good luck with the next session!** 🚀

**Remember**:
- Keep code clean and maintainable
- Follow existing patterns
- Document as you go
- Test thoroughly before committing

---

**Prepared by**: Claude Sonnet 4.5
**Date**: 2024-12-27
**Status**: Ready for next session
