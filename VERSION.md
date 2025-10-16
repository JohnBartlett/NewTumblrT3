# Version History

## v0.10.0 - Current Version (October 15, 2025)

### 🚀 Major Update: PostgreSQL Migration & Advanced Authentication

#### Database Migration:
- ✅ **PostgreSQL** replaces SQLite for production-ready storage
- ✅ **Database seeding** with test accounts (Admin, User, Moderator)
- ✅ **Enhanced schema** with role-based access control
- ✅ **Migration tools** (`npm run db:migrate`, `db:seed`, `db:reset`)

#### User Roles & Admin System:
- ✅ **Role system**: USER, ADMIN, MODERATOR
- ✅ **Admin dashboard** with user management
- ✅ **Permission controls** for sensitive operations
- ✅ **User role updates** (admin only)
- ✅ **System statistics** (admin/moderator access)
- ✅ **User deletion** with self-deletion protection

#### Enhanced Authentication:
- ✅ **Email verification** system with secure tokens
- ✅ **Password reset** with expiring tokens (1 hour)
- ✅ **Account recovery** by email with masked username
- ✅ **Password strength validation** (min 8 chars, letter + number)
- ✅ **Bcrypt hashing** with 12 salt rounds (increased from 10)
- ✅ **Last login tracking** for security monitoring
- ✅ **Email verification status** displayed in UI

#### Settings Enhancements:
- ✅ **Change password** with current password verification
- ✅ **Resend verification email** button
- ✅ **Email verification alert** for unverified accounts
- ✅ **Password security info** with last login time
- ✅ **Download filename patterns** (6 customizable patterns)
- ✅ **Index numbering** option for bulk downloads
- ✅ **Metadata sidecar files** (.txt) for downloaded images

#### Security Features:
- ✅ **Secure token generation** using crypto.randomBytes
- ✅ **Token expiration** for password resets
- ✅ **Account enumeration protection** (generic error messages)
- ✅ **Self-deletion prevention** for admins
- ✅ **Password reuse prevention** (can't reuse current password)

#### Additional Updates:
- ✅ **Notes panel redesign** with color-coded tabs
- ✅ **Grid display settings** (columns & image size)
- ✅ **Terse notes display** for compact viewing
- ✅ **Clickable like/reblog counts** with filtered views
- ✅ **Sticky filter menu** with lock/unlock icon
- ✅ **Selection toolbar redesign** with modern aesthetics
- ✅ **Store button** for saving images to database
- ✅ **Keyboard navigation scrolling** fixed

#### Test Accounts:
```
Admin:     admin@tumblr.local      | admin      | Admin123!
Test User: test@tumblr.local       | testuser   | Test123!
Moderator: moderator@tumblr.local  | moderator  | Mod123!
```

#### Documentation:
- ✅ DATABASE.md updated with PostgreSQL setup
- ✅ Security features documented
- ✅ Admin functions documented
- ✅ Seed data instructions
- ✅ Production deployment guide

---

## v0.9.0 - (October 15, 2025)

### 🎉 Major Feature: Advanced Grid Selection System

#### Grid Selection Features:
- ✅ **Direct grid selection** with checkboxes on hover
- ✅ **Multi-select**: Ctrl/Cmd+Click for individual selection
- ✅ **Range select**: Shift+Click for range selection  
- ✅ **Bulk actions**: Select All, Deselect All, Invert Selection
- ✅ **Selection toolbar** with count and action buttons
- ✅ **Download/Delete** selected images (UI ready)

#### Advanced Filtering:
- ✅ **Size filter**: Small, Medium, Large images
- ✅ **Date filter**: Today, This Week, This Month
- ✅ **Sort options**: Recent, Popular, Oldest
- ✅ **Real-time filtering** with active filter count
- ✅ **Clear all filters** quick action

#### Keyboard Navigation:
- ✅ **Home**: Jump to first image
- ✅ **End**: Jump to last image
- ✅ **Page Up**: Navigate up 3 rows
- ✅ **Page Down**: Navigate down 3 rows
- ✅ **Arrow keys**: Navigate grid (Up, Down, Left, Right)
- ✅ **Enter**: Open focused image in viewer
- ✅ **Space**: Toggle selection on focused image
- ✅ **Visual focus indicator** (ring highlight)

### UI Improvements:
- ✅ Selection overlay with checkmark
- ✅ Hover states for better UX
- ✅ Responsive grid layout with filter sidebar
- ✅ Empty state with clear filters action
- ✅ Selection count badge in toolbar
- ✅ Keyboard shortcuts hint in toolbar

---

## v0.8.0 - (October 15, 2025)

### Major Features Added:
- ✅ Search functionality with blog results
- ✅ Blog view with 300+ image test blog (photoarchive)
- ✅ Images Only mode (Dashboard & Blog)
- ✅ Clickable blog names and notes
- ✅ Like functionality for posts
- ✅ Image counter in ImageViewer
- ✅ Jump to Start/End navigation in ImageViewer
- ✅ Image selection in ImageViewer modal
- ✅ Follow/Unfollow blogs (renamed from Subscribe)
- ✅ Comprehensive caching system (Service Worker, React Query, Image Cache)
- ✅ Offline support
- ✅ Version badge on all pages

### Changes:
- Renamed "Subscribe" → "Follow" for Tumblr consistency
- Fixed TypeScript configuration issues
- Improved filter menu layout
- Added image preloading and caching
- Enhanced ImageViewer with full navigation controls

### Technical:
- Service Worker caching (90 days for images)
- React Query persistence (7 days)
- Image cache manager with metadata tracking
- General cache manager for flexible data storage

