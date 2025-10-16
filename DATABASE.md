# Database Documentation

This application uses **PostgreSQL** with **Prisma ORM** for robust data storage and user management.

## Database Schema

### Users Table
Stores user account information:
- `id`: Unique identifier (UUID)
- `email`: User email (unique)
- `username`: Username (unique)
- `passwordHash`: Bcrypt hashed password (12 salt rounds)
- `displayName`: Optional display name
- `avatar`: Profile picture URL
- `bio`: User biography
- `role`: User role (USER, ADMIN, MODERATOR)
- `emailVerified`: Email verification status (boolean)
- `emailVerificationToken`: Token for email verification
- `passwordResetToken`: Token for password reset
- `passwordResetExpiry`: Password reset token expiration
- `lastLoginAt`: Last login timestamp
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp

### UserPreferences Table
Stores user interface preferences:
- `theme`: light/dark/system
- `fontSize`: Font size (px)
- `viewMode`: full/images-only
- `reducedMotion`: Boolean
- `enableHaptics`: Boolean
- `enableGestures`: Boolean

### Posts Table
User-created posts:
- `type`: text/photo/quote/link/video/audio
- `content`: Post content
- `tags`: JSON array of tags
- `timestamp`: Post creation time
- `published`: Boolean (published/draft)

### Blogs Table
User-created blog pages:
- `name`: Unique blog identifier
- `title`: Blog display title
- `description`: Blog description
- `url`: Blog URL
- `avatar`: Blog avatar image
- `headerImage`: Blog header banner
- `theme`: Blog theme name
- `posts`: Post count
- `followers`: Follower count

### Additional Tables
- **Drafts**: Unpublished post drafts
- **SavedPost**: User's saved posts
- **LikedPost**: User's liked posts  
- **Follow**: User follow relationships
- **SearchHistory**: User's search queries

## Authentication System

### Registration
```typescript
// Create a new user
const user = await AuthService.register({
  email: 'user@example.com',
  username: 'myusername',
  password: 'securepassword',
  displayName: 'My Name' // optional
});
```

### Login
```typescript
// Login with email or username
const session = await AuthService.login({
  emailOrUsername: 'user@example.com', // or 'myusername'
  password: 'securepassword'
});
```

### Password Security
- Passwords are hashed using **bcrypt** with 12 salt rounds
- Never stored in plain text
- Validated on every login attempt
- Password strength requirements:
  - Minimum 8 characters
  - At least one letter
  - At least one number
  
### Email Verification
- New accounts receive a verification email (in dev: check console)
- Users must verify email to access all features
- Verification tokens are unique and secure
- Can resend verification emails

### Password Reset
- Secure password reset via email token
- Tokens expire after 1 hour
- Prevents account enumeration attacks
- Can request reset by email or username

### Account Recovery
- Find account by email address
- Returns masked username for security
- Helps users recover forgotten usernames

## User Data Management

### Preferences
```typescript
// Get user preferences
const prefs = await PreferencesService.getPreferences(userId);

// Update preferences
await PreferencesService.updatePreferences(userId, {
  theme: 'dark',
  viewMode: 'images-only',
  fontSize: 18
});
```

### Posts
```typescript
// Create a post
const post = await PostsService.createPost(userId, {
  type: 'photo',
  content: 'https://example.com/image.jpg',
  tags: ['photography', 'nature'],
  published: true
});

// Get user's posts
const posts = await PostsService.getUserPosts(userId, {
  limit: 20,
  offset: 0,
  publishedOnly: true
});

// Like a post
await PostsService.likePost(userId, postId);

// Save a post
await PostsService.savePost(userId, postId);
```

## User Roles & Permissions

### Role Types
- **USER**: Standard user with basic permissions
- **MODERATOR**: Can moderate content and view system stats
- **ADMIN**: Full system access including user management

### Admin Functions
Admins can:
- View all users
- Update user roles
- Delete users (except themselves)
- View system statistics
- Manage content across the platform

## Database Configuration

### PostgreSQL Setup
The application connects to PostgreSQL using an environment variable:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

Example for local development:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/tumblr_dev"
```

**Note**: Database credentials are excluded from git via `.gitignore`.

## Prisma Commands

### Generate Prisma Client
```bash
npx prisma generate
```

### Run Migrations
```bash
npm run db:migrate
# or
npx prisma migrate dev
```

### Seed Database with Test Data
```bash
npm run db:seed
```

Test accounts created by seed:
- **Admin**: `admin@tumblr.local` / `admin` / `Admin123!`
- **Test User**: `test@tumblr.local` / `testuser` / `Test123!`
- **Moderator**: `moderator@tumblr.local` / `moderator` / `Mod123!`

### View Database
```bash
npm run db:studio
# or
npx prisma studio
```

### Reset Database (⚠️ Deletes all data)
```bash
npm run db:reset
```

## Session Management

- User sessions are stored in **localStorage** using the user ID
- Sessions persist across browser refreshes
- Logout clears the session from localStorage

## Data Privacy & Security

- All passwords are hashed with bcrypt (12 salt rounds)
- Email verification tokens are cryptographically secure
- Password reset tokens expire after 1 hour
- User sessions are tracked with `lastLoginAt`
- Role-based access control for sensitive operations
- Database can be backed up using PostgreSQL tools (`pg_dump`)

## Production Deployment

### Environment Variables
Set these in production:
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="app-password"
EMAIL_FROM="noreply@yourdomain.com"
SESSION_SECRET="your-secure-random-string"
BASE_URL="https://yourdomain.com"
```

### Database Migrations
Always run migrations in production:
```bash
npx prisma migrate deploy
```

### Backups
Regular PostgreSQL backups recommended:
```bash
pg_dump -U username -d database_name -F c -b -v -f backup.dump
```

## Future Enhancements

Potential features to add:
- [ ] Two-factor authentication (2FA)
- [ ] OAuth providers (Google, GitHub, etc.)
- [ ] Database encryption at rest
- [ ] Automated backup system
- [ ] Data export/import functionality
- [ ] Audit logging for admin actions

