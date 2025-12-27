# Design System V2 - Modern UI/UX Redesign

> **Date**: 2024-12-27
> **Status**: ✅ Completed
> **Commit**: `0febf16`, `30cc1d1`

---

## 🎨 Overview

Complete UI/UX redesign implementing 2025 design trends with Rose + Brown color palette. Focused on creating a warm, modern, and family-friendly aesthetic.

---

## 📋 Table of Contents

1. [Color Palette](#color-palette)
2. [Design Principles](#design-principles)
3. [Component Updates](#component-updates)
4. [Page Redesigns](#page-redesigns)
5. [New Features](#new-features)
6. [Technical Implementation](#technical-implementation)

---

## 🎨 Color Palette

### Base Colors

```css
/* Primary: Rose Pink */
--primary: oklch(0.65 0.24 12);  /* #F43F5E */

/* Accent: Warm Brown/Amber */
--accent: oklch(0.55 0.15 50);   /* #B45309 */

/* Extended Palette */
--success: oklch(0.7 0.18 160);  /* Mint Green */
--info: oklch(0.7 0.15 230);     /* Sky Blue */
--warning: oklch(0.68 0.18 60);  /* Orange */
--destructive: oklch(0.577 0.245 27.325); /* Red */
```

### Design Tokens

- **Border Radius**: `1rem` (16px) → More rounded
- **Border**: `oklch(.../ 0.3)` → Subtle transparency
- **Card**: `oklch(.../ 0.8)` → Glassmorphism
- **Shadows**: Color-tinted (primary/accent)

---

## 🎯 Design Principles

### 1. Glassmorphism
- Backdrop blur effects
- Semi-transparent backgrounds
- Layered depth

### 2. Soft Shadows
- Color-tinted shadows (primary/accent)
- Multi-layer shadows for depth
- Hover shadow expansion

### 3. Gradient Accents
- Rose → Brown gradients
- Subtle background gradients
- Button/badge gradient fills

### 4. Micro-animations
- 200-300ms smooth transitions
- Hover lift effects (`translateY(-0.5px)`)
- Scale animations (`scale(0.98)` on active)
- Bounce effects for icons

### 5. Rounded Corners
- `rounded-xl` (12px): Inputs, cards
- `rounded-2xl` (16px): Large cards
- `rounded-full`: Pills, avatars

---

## 🧩 Component Updates

### Button
```tsx
// Before: Flat colors
bg-primary hover:bg-primary/90

// After: Gradient + Shadow + Lift
bg-gradient-to-br from-primary to-primary/90
shadow-md shadow-primary/20
hover:shadow-lg hover:-translate-y-0.5
active:scale-[0.98]
```

**Variants:**
- `default`: Rose gradient
- `secondary`: Brown gradient
- `outline`: Border + backdrop blur
- `success/info`: New variants

### Card
```tsx
// Glassmorphic styling
bg-card/80 backdrop-blur-md
border border-border/50
shadow-lg
hover:shadow-xl hover:-translate-y-1
```

### Input / Textarea
```tsx
// Modern input with focus glow
h-11 rounded-xl border-2
bg-background/50 backdrop-blur-sm
focus:border-primary focus:ring-4 focus:ring-primary/20
hover:border-primary/50
```

### Badge
```tsx
// Gradient badges
bg-gradient-to-r from-primary/90 to-primary
border-primary/20
shadow-sm
```

---

## 📱 Page Redesigns

### 1. Home Dashboard

**Before:** Simple card grid
**After:** Interactive dashboard

```
- Time-based greeting (🌅☀️🌙)
- Icon-driven quick actions
- Gradient section headers
- Hover scale animations
```

**Components:**
- 7-8 action cards (Home, Chat, Board, Todos, Photos, Files, Calendar, Settings, Admin)
- Each with unique icon and gradient
- Hover effects: scale(1.02) + shadow expand

### 2. Chat Page

**Bubble UI:**
```
Current User:
┌─────────────────────────┐
│ Message content         │ ← Rose gradient
│ (rounded-2xl)           │
└─────────────────────────┘

Other User:
  ┌────────────────────────┐
┌─┐ Name                   │
│A│ Message content        │ ← Glassmorphic
└─┘ (rounded-2xl)          │
  └────────────────────────┘
```

**Features:**
- Avatar circles (first letter)
- Timestamp below bubble
- Slide-in animation
- Delete button on hover (own messages)
- Deleted message placeholder

### 3. Board Page

**Instagram-style Cards:**
```
┌──────────────────────┐
│  [Image Header]      │ ← Zoom on hover
│  ┌──┐               │
│  │A │ Author Name   │ ← Avatar
│  └──┘ Date          │
│  Content preview... │
│  💬 3 | Read more → │
└──────────────────────┘
```

### 4. Todos Page

**Enhanced Cards:**
```
┌────────────────────────────┐
│ ☑️ Task Title              │
│    Description             │
│    ┌──┐ → ┌──┐            │
│    │C │   │A │ Assignee   │
│    └──┘   └──┘            │
└────────────────────────────┘
```

**Features:**
- Success-colored checkboxes
- Creator/Assignee avatars
- Hover delete button (fade in)
- Completed state (opacity + bg)

### 5. Login Page

**Modern Auth:**
```
┌─────────────────────────┐
│     ┌────────┐          │
│     │  ❤️    │          │ ← Gradient logo
│     └────────┘          │
│   Family App            │ ← Gradient text
│   Welcome back! 👋      │
│                         │
│   [Sign In Form]        │
│                         │
│   Built with love ❤️    │
└─────────────────────────┘

Background: Gradient + blur orbs
```

---

## ✨ New Features

### 1. Chat Message Deletion

**Implementation:**
```tsx
// Prisma Schema
model ChatMessage {
  isDeleted  Boolean   @default(false)
  deletedAt  DateTime?
  // ...
}

// API
DELETE /api/chat/messages/[messageId]

// UI
Hover → 🗑️ Delete button
Deleted → "🚫 삭제된 메시지입니다"
```

**Design:**
- Delete button on left side (own messages)
- Dashed border for deleted messages
- Muted colors + italic text

### 2. Photos Album

**Structure:**
```
Photos
├── page.tsx (Grid + Upload button)
├── photo-grid.tsx (Instagram grid)
├── photo-card.tsx (Hover overlay)
├── photo-lightbox.tsx (Modal viewer)
└── photo-upload.tsx (Upload form)
```

**Prisma Models:**
```prisma
model Album {
  id        String
  name      String
  photos    Photo[]
  creator   FamilyMember
}

model Photo {
  id         String
  imageUrl   String
  caption    String?
  album      Album?
  uploader   FamilyMember
}
```

**API Endpoints:**
- `POST /api/photos` - Upload photo
- `GET /api/photos` - List photos
- `DELETE /api/photos/[photoId]` - Delete photo

**Features:**
- Instagram-style grid (2-4 columns)
- Hover: Overlay with uploader info
- Click: Lightbox modal
  - Keyboard nav (←→, ESC)
  - Image info card
  - Photo counter (1/10)
- Upload: Image + caption
- Delete: Own photos only

### 3. Bubbly Navigation

**Desktop:**
```tsx
🏡 💬 📌 ✅ 🌸 🗂️ 🗓️ ⚙️
↑ Each icon bounces on hover
↑ Gradient pill background
↑ Scale animation (1.05)
```

**Mobile:**
```tsx
🏡 Home
💬 Chat
📌 Board
...
→ Large emoji + text
→ Gradient hover
```

**Emoji Icons:**
- 🏡 Home
- 💬 Chat
- 📌 Board
- ✅ Todos
- 🌸 Photos (NEW)
- 🗂️ Files
- 🗓️ Calendar
- ⚙️ Settings
- 🛡️ Admin

### 4. Floating Bottom Nav (Mobile)

**Design:**
```
┌──────────────────────────────┐
│  🏠    💬    📷    ✅    ☰  │
│ Home  Chat Photo Todo  More │
└──────────────────────────────┘
   ↑ Active: Gradient + dot
   ↑ Glassmorphic background
   ↑ Rounded corners
   ↑ Shadow
```

**Features:**
- Fixed position (bottom)
- Glassmorphic backdrop
- Active state: Gradient fill + ping dot
- Scale animation on click
- 5 main tabs

---

## 🛠️ Technical Implementation

### Dependencies Added

```json
{
  "framer-motion": "^11.0.0"  // Advanced animations
}
```

### CSS Utilities

```css
/* Glassmorphism */
.glass {
  background: var(--card) / 0.8;
  backdrop-filter: blur(12px);
}

/* Shadow with color */
.shadow-primary {
  box-shadow: 0 4px 6px rgb(from var(--primary) r g b / 0.2);
}

/* Smooth transitions */
.transition-smooth {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Animation Classes

```css
/* Bounce on hover */
.hover-bounce:hover {
  animation: bounce 0.5s ease;
}

/* Lift effect */
.hover-lift:hover {
  transform: translateY(-2px);
}

/* Scale on active */
.active-scale:active {
  transform: scale(0.98);
}
```

---

## 📊 Before/After Comparison

| Aspect | Before | After |
|--------|--------|-------|
| **Colors** | Gray-50, basic primary | Rose + Brown palette |
| **Shadows** | Simple gray shadows | Color-tinted shadows |
| **Borders** | Solid 1px | Transparent borders |
| **Buttons** | Flat colors | Gradients + shadows |
| **Cards** | Basic white | Glassmorphic |
| **Nav** | Text links | Emoji + bubbly pills |
| **Mobile Nav** | Hamburger menu | Floating bottom nav |
| **Animations** | Minimal | Micro-interactions |
| **Photos** | N/A | Instagram grid + lightbox |

---

## 🎯 Design Goals Achieved

✅ **Modern & Trendy** - 2025 design trends
✅ **Warm & Cozy** - Rose + Brown palette
✅ **Playful & Cute** - Emoji icons, bounce effects
✅ **Smooth UX** - Micro-animations, transitions
✅ **Mobile-First** - Floating bottom nav
✅ **Glassmorphism** - Blur + transparency
✅ **Accessibility** - Keyboard nav, focus states

---

## 📝 Usage Guidelines

### Adding New Pages

1. Use gradient headers:
```tsx
<h1 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
  Page Title
</h1>
```

2. Use icon containers:
```tsx
<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10">
  <Icon className="w-6 h-6 text-primary" />
</div>
```

3. Use glassmorphic cards:
```tsx
<Card className="backdrop-blur-md border-border/50">
  ...
</Card>
```

### Color Usage

- **Primary (Rose)**: Main actions, active states
- **Accent (Brown)**: Secondary actions, highlights
- **Success**: Todo checkboxes, success states
- **Info**: Informational elements
- **Warning**: Warnings, important notices
- **Destructive**: Delete actions, errors

---

## 🚀 Next Steps

### Potential Enhancements

1. **Animations**
   - Confetti on photo upload
   - Ripple effect on buttons
   - Page transitions

2. **Features**
   - Photo albums (folders)
   - Photo reactions (likes)
   - Comment on photos

3. **Optimization**
   - Image lazy loading
   - Virtual scrolling
   - Code splitting

---

## 📚 Related Documentation

- [DEVELOPMENT_PROGRESS.md](../DEVELOPMENT_PROGRESS.md) - Full dev history
- [README.md](../README.md) - Project overview
- [Prisma Schema](../prisma/schema.prisma) - Database schema

---

**Last Updated**: 2024-12-27
**Maintained by**: Claude Sonnet 4.5 + Partner
