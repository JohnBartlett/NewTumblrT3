# Technical Architecture

Detailed technical documentation of the Tumblr T3 application architecture.

## Table of Contents
- [System Overview](#system-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Database Schema](#database-schema)
- [State Management](#state-management)
- [Routing](#routing)
- [API Communication](#api-communication)

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     User Browser                            │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  React Application (Port 5173)                        │ │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐ │ │
│  │  │   UI Layer  │  │  State Mgmt  │  │   Routing   │ │ │
│  │  │  (Tailwind) │  │   (Jotai)    │  │  (TanStack) │ │ │
│  │  └─────────────┘  └──────────────┘  └─────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │          React Query (Data Layer)                │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────┘ │
│                          │ HTTP                            │
│                          ▼                                  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Express Server (Port 3001)                     │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  REST API Endpoints                                   │ │
│  │  ┌────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │   Auth     │  │    Users     │  │  Preferences │ │ │
│  │  │ /api/auth  │  │  /api/users  │  │  /api/prefs  │ │ │
│  │  └────────────┘  └──────────────┘  └──────────────┘ │ │
│  └───────────────────────────────────────────────────────┘ │
│                          │ Prisma ORM                      │
│                          ▼                                  │
│  ┌───────────────────────────────────────────────────────┐ │
│  │             SQLite Database (dev.db)                  │ │
│  │  Users | Preferences | Posts | Likes | Follows       │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Routing**: TanStack Router
- **State Management**: Jotai (atomic state)
- **Data Fetching**: TanStack Query (React Query)
- **Styling**: Tailwind CSS + class-variance-authority
- **Animations**: Framer Motion
- **UI Components**: Custom components following Apple HIG

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript (via tsx)
- **Database ORM**: Prisma Client
- **Authentication**: bcryptjs
- **CORS**: cors middleware

### Database
- **Type**: PostgreSQL (production-ready)
- **ORM**: Prisma
- **Connection**: Via DATABASE_URL environment variable
- **Migrations**: Prisma migrate
- **Seeding**: Automated test data generation

### Development Tools
- **Type Checking**: TypeScript 5
- **Linting**: ESLint
- **Formatting**: Prettier
- **Git Hooks**: Husky + lint-staged
- **Task Runner**: npm scripts + concurrently

---

## Project Structure

```
NewTumblrT3/
├── docs/                          # Documentation
│   ├── FEATURES.md
│   ├── TECHNICAL_ARCHITECTURE.md
│   └── USER_GUIDE.md
├── prisma/                        # Database
│   ├── schema.prisma             # Database schema
│   └── dev.db                    # SQLite database file
├── server/                        # Backend API
│   └── index.ts                  # Express server
├── src/                          # Frontend source
│   ├── components/               # React components
│   │   ├── layouts/             # Layout components
│   │   ├── navigation/          # Navigation components
│   │   ├── providers/           # Context providers
│   │   └── ui/                  # UI components
│   ├── features/                # Feature modules
│   │   ├── auth/               # Authentication
│   │   ├── blog/               # Blog viewing
│   │   ├── dashboard/          # Main feed
│   │   ├── profile/            # User profile
│   │   ├── search/             # Search
│   │   ├── settings/           # Settings
│   │   └── tag/                # Tag viewing
│   ├── hooks/                   # React hooks
│   │   └── queries/            # React Query hooks
│   ├── lib/                     # Utilities
│   │   ├── db.ts               # Prisma client
│   │   └── queryClient.ts      # React Query client
│   ├── routes/                  # Route definitions
│   ├── services/                # API services
│   │   ├── api/                # HTTP clients
│   │   └── db/                 # Database services (unused in browser)
│   ├── store/                   # Jotai atoms
│   ├── styles/                  # CSS files
│   ├── types/                   # TypeScript types
│   ├── utils/                   # Helper functions
│   ├── App.tsx                  # Root component
│   └── main.tsx                 # Entry point
├── public/                       # Static assets
├── API_SETUP.md                 # API documentation
├── DATABASE.md                  # Database documentation
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── tailwind.config.js           # Tailwind config
└── vite.config.ts               # Vite config
```

---

## Frontend Architecture

### Component Hierarchy

```
App (Router Provider)
├── ThemeProvider
│   ├── RootLayout
│   │   ├── Navigation
│   │   └── Outlet (Route Content)
│   │       ├── Dashboard
│   │       │   ├── PostCard[]
│   │       │   └── ImageViewer
│   │       │       └── NotesPanel
│   │       ├── Blog
│   │       │   ├── BlogHeader
│   │       │   ├── PostCard[]
│   │       │   ├── ImageViewer
│   │       │   └── NotesPanel
│   │       ├── TagView
│   │       │   ├── TagHeader
│   │       │   ├── PostCard[]
│   │       │   └── ImageViewer
│   │       ├── Auth (Login/Register)
│   │       ├── Profile
│   │       └── Settings
```

### Component Organization

#### UI Components (`src/components/ui/`)
- **Atomic components**: Button, Input, Card, etc.
- **Composed components**: ImageViewer, NotesPanel, Sheet
- **Reusable**: Used across multiple features
- **Styled with**: Tailwind CSS + CVA

#### Layout Components (`src/components/layouts/`)
- **RootLayout**: Main app wrapper
- **Container**: Content width constraints
- **Grid**: Responsive grid system
- **GridItem**: Grid item wrapper

#### Feature Components (`src/features/`)
- **Page-level components**: Dashboard, Blog, Auth, etc.
- **Feature-specific logic**: State, hooks, utilities
- **Self-contained**: Minimal external dependencies

---

## Backend Architecture

### API Layer (`server/index.ts`)

```typescript
Express App
├── Middleware
│   ├── CORS
│   └── JSON Parser
├── Routes
│   ├── POST /api/auth/register
│   ├── POST /api/auth/login
│   ├── GET  /api/users/:id
│   ├── GET  /api/users/:id/preferences
│   └── PUT  /api/users/:id/preferences
└── Database (Prisma Client)
```

### Request Flow

```
1. Client → HTTP Request → Express Server
2. Express → Route Handler → Validation
3. Route Handler → Prisma Client → Database Query
4. Database → Prisma Client → Transform Data
5. Prisma Client → Route Handler → JSON Response
6. Express Server → HTTP Response → Client
```

### Error Handling

```typescript
try {
  // Database operation
  const result = await prisma.user.create(...);
  res.json(result);
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({ error: 'Operation failed' });
}
```

---

## Database Schema

### Entity Relationship Diagram

```
User (1) ─────────── (1) UserPreferences
  │
  ├── (1:N) ────────── Posts
  ├── (1:N) ────────── Drafts
  ├── (1:N) ────────── SavedPost (many-to-many with Post)
  ├── (1:N) ────────── LikedPost (many-to-many with Post)
  ├── (1:N) ────────── SearchHistory
  └── (1:N) ────────── Follow (self-referential)
```

### Key Tables

#### Users
```sql
User {
  id            String   @id @default(uuid())
  email         String   @unique
  username      String   @unique
  passwordHash  String
  displayName   String?
  avatar        String?
  bio           String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

#### UserPreferences
```sql
UserPreferences {
  id             String   @id @default(uuid())
  userId         String   @unique
  theme          String   @default("system")
  fontSize       Int      @default(16)
  viewMode       String   @default("full")
  reducedMotion  Boolean  @default(false)
  enableHaptics  Boolean  @default(true)
  enableGestures Boolean  @default(true)
}
```

#### Posts
```sql
Post {
  id        String   @id @default(uuid())
  userId    String
  type      String   // text, photo, quote, link
  content   String
  tags      String   // JSON array
  timestamp DateTime @default(now())
  published Boolean  @default(true)
}
```

---

## State Management

### Jotai Atoms

#### Auth State (`src/store/auth.ts`)
```typescript
userAtom           // Current logged-in user
loginAtom          // Login action atom
logoutAtom         // Logout action atom
```

#### Preferences State (`src/store/preferences.ts`)
```typescript
preferencesAtom         // All user preferences
themeModeAtom          // Derived: theme mode
fontSizeAtom           // Derived: font size
viewModeAtom           // Derived: view mode
updatePreferencesAtom  // Action: update preferences
```

#### Search State (`src/store/search.ts`)
```typescript
searchQueryAtom    // Current search query
searchHistoryAtom  // Search history
searchResultsAtom  // Search results
```

### State Flow

```
Component → useAtom(atom) → Read/Write State
                ↓
         Triggers Re-render
                ↓
         Component Updates
```

---

## Routing

### TanStack Router Setup

```typescript
rootRoute (/)
├── indexRoute        →  Dashboard
├── dashboardRoute    →  /dashboard
├── authRoute         →  /auth?mode=login|register
├── profileRoute      →  /profile
├── settingsRoute     →  /settings
├── searchRoute       →  /search
├── blogRoute         →  /blog/:username
└── tagRoute          →  /tag/:tag?scope=user|all&blog=:username
```

### Route Features
- **Type-safe params**: TypeScript validation
- **Search params**: Query parameter validation
- **Lazy loading**: Code splitting (disabled for now)
- **Preloading**: Intent-based preloading
- **Navigation**: Programmatic navigation with `useNavigate()`

---

## API Communication

### React Query Integration

```typescript
// Query Hook
const { data, isLoading, error } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => authApi.getUserById(userId),
  staleTime: Infinity
});

// Mutation Hook
const { mutate, isPending } = useMutation({
  mutationFn: (data) => authApi.register(data),
  onSuccess: () => navigate('/'),
  onError: (error) => setError(error.message)
});
```

### HTTP Client (`src/services/api/auth.api.ts`)

```typescript
const API_URL = 'http://localhost:3001';

async register(data): Promise<UserSession> {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) throw new Error(await response.json());
  return response.json();
}
```

### Caching Strategy
- **User data**: Infinite stale time (doesn't change often)
- **Posts**: 5-minute cache
- **Preferences**: Infinite stale time
- **Search**: No cache (fresh on every search)

---

## Mobile Architecture (v0.10.1)

### Responsive Design Strategy
- **Mobile-first approach**: Base styles for mobile, then scale up
- **Breakpoints**:
  - `xs`: Default (< 640px) - Phones
  - `sm`: 640px+ - Large phones, small tablets
  - `md`: 768px+ - Tablets
  - `lg`: 1024px+ - Desktops
  - `xl`: 1280px+ - Large desktops

### Touch Event Handling
```typescript
// Proper touch event handling
<button
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    // Handle action
  }}
  className="touch-manipulation active:scale-95"
>
```
- **`touch-manipulation`**: Disables double-tap zoom
- **`active:scale-95`**: Visual feedback on press
- **`preventDefault`**: Prevents default browser behaviors
- **`stopPropagation`**: Prevents event bubbling

### Sticky Positioning System
```typescript
// Z-index layering (highest to lowest)
Navigation:     z-50, top-0     (always on top)
SelectionToolbar: z-20, top-16  (below nav)
FilterBar:      z-10, top-32    (below toolbar when sticky)
Content:        z-0              (normal flow)
```
- **64px offset**: Navigation bar height (h-16 = 64px)
- **128px offset**: Nav + Toolbar (16 + 16 = 32 * 4px = 128px)
- **Conditional sticky**: Filter bar only sticky when `isFilterSticky` is true

### Viewport Configuration
```html
<meta 
  name="viewport" 
  content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
/>
```
- **`maximum-scale=1.0`**: Prevents pinch-to-zoom
- **`user-scalable=no`**: Disables zoom gestures
- **`viewport-fit=cover`**: iPhone notch support

### CSS Mobile Fixes
```css
/* Prevent text size adjustment */
-webkit-text-size-adjust: 100%;

/* Remove tap highlight */
-webkit-tap-highlight-color: transparent;

/* Prevent overscroll bounce */
overscroll-behavior: none;

/* Smooth touch scrolling */
-webkit-overflow-scrolling: touch;

/* Input zoom prevention */
input { font-size: 16px !important; }

/* Safe area padding */
body { padding-bottom: env(safe-area-inset-bottom); }
```

### Mobile Component Patterns
```typescript
// Responsive class pattern
className="
  p-2 sm:p-4           // Padding scales up
  text-xs sm:text-sm   // Text scales up
  gap-1.5 sm:gap-2     // Spacing scales up
  hidden sm:inline     // Hidden on mobile
  md:hidden            // Hidden on desktop
  flex-col sm:flex-row // Stack on mobile
"
```

### Range Selection Architecture
```typescript
// Desktop: Shift+Click
if (e.shiftKey && lastSelectedIndex !== null) {
  // Select range from lastSelectedIndex to current
}

// Mobile: Two-tap mode
if (rangeMode) {
  if (rangeStart === null) {
    setRangeStart(index);  // First tap
  } else {
    selectRange(rangeStart, index);  // Second tap
    setRangeMode(false);
  }
}
```
- **State management**: `rangeMode`, `rangeStart` in component state
- **Visual feedback**: Yellow ring, "START" badge
- **Mode toggle**: Dedicated "Range" button (mobile only)

### Bottom Navigation Implementation
```typescript
// Only render on mobile + when logged in
{currentUser && (
  <div className="
    fixed bottom-0 left-0 right-0 
    z-50 block md:hidden
    bg-white/80 backdrop-blur-lg
  ">
    <MobileBottomNav />
  </div>
)}

// Add bottom padding to content
<main className="pb-20 md:pb-0">
```
- **Fixed positioning**: Always visible at bottom
- **Backdrop blur**: Glass morphism effect
- **Safe area**: `env(safe-area-inset-bottom)` padding

---

## Image Management System (v0.10.0)

### Download Architecture
```typescript
interface ImageMetadata {
  blogName: string;
  blogUrl: string;
  tags: string[];
  notes: number;
  timestamp: number;
  description?: string;
  postUrl: string;
}

// Web Share API for mobile
if (navigator.canShare && navigator.canShare({ files })) {
  await navigator.share({ 
    files: [imageFile, metadataFile],
    text: `From ${blogName}: ${tags.join(', ')}`
  });
}

// Direct download for desktop
const link = document.createElement('a');
link.href = URL.createObjectURL(blob);
link.download = filename;
link.click();
```

### Filename Generation
```typescript
type FilenamePattern = 
  | 'blog-tags-date'
  | 'date-blog-tags'
  | 'blog-description'
  | 'tags-only'
  | 'timestamp'
  | 'simple';

function generateFilename(
  pattern: FilenamePattern,
  metadata: ImageMetadata,
  index?: number
): string {
  // Pattern-based filename generation
  // e.g., "photoarchive_nature-landscape_2025-10-15.jpg"
}
```

### Metadata Sidecar Files
```typescript
// Generate .txt file with metadata
const metadata = `
Blog: ${blogName}
URL: ${postUrl}
Tags: ${tags.join(', ')}
macOS Spotlight Tags: mdfind:kMDItemUserTags=${tags.join(',')}
Notes: ${notes}
Downloaded: ${new Date().toISOString()}
`;

// Download alongside image
downloadMetadataSidecar(metadata, filename);
```

### Database Storage
```typescript
// StoredImage model
model StoredImage {
  id          String   @id @default(uuid())
  userId      String
  postId      String
  blogName    String
  url         String
  width       Int?
  height      Int?
  tags        String   // JSON array
  description String?
  notes       Int
  timestamp   DateTime
  storedAt    DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id])
  
  @@unique([userId, postId])  // Prevents duplicates
  @@index([userId, blogName, storedAt])
}
```

### Grid Customization System
```typescript
// User preferences
interface Preferences {
  gridColumns: number;      // 2-6
  gridImageSize: GridImageSize;  // compact | comfortable | spacious
  filenamePattern: FilenamePattern;
  includeIndexInFilename: boolean;
}

// Dynamic grid styling
style={{
  gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
  gap: gridImageSize === 'compact' ? '0.25rem' 
     : gridImageSize === 'comfortable' ? '0.5rem' 
     : '1rem'
}}
```

---

## Build & Deployment

### Development
```bash
npm run dev      # Both frontend + backend
npm run client   # Frontend only (port 5173)
npm run server   # Backend only (port 3001)
```

### Production Build
```bash
npm run build    # Build frontend to /dist
# Backend runs directly with tsx/node
```

### Environment Variables
```bash
# Frontend (.env)
VITE_API_URL=http://localhost:3001

# Backend (.env)
DATABASE_URL="file:./dev.db"
PORT=3001
```

---

## Performance Optimizations

1. **Code Splitting**: Route-based chunks
2. **Lazy Loading**: Images load on scroll
3. **Memoization**: useMemo, useCallback
4. **Virtual Scrolling**: Infinite scroll
5. **Debouncing**: Search input
6. **Caching**: React Query cache
7. **Optimistic Updates**: Instant UI updates
8. **Bundle Optimization**: Tree shaking, minification

