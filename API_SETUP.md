# API Server Setup

The application now uses a **Node.js/Express backend** to handle database operations, as Prisma cannot run in the browser.

## Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌──────────────┐
│  React Frontend │ ──HTTP──│ Express Server  │ ──ORM──│   SQLite DB  │
│  (Port 5173)    │         │  (Port 3001)    │        │  (dev.db)    │
└─────────────────┘         └─────────────────┘         └──────────────┘
```

## Running the Application

### Start Everything (Recommended)
```bash
npm run dev
```
This starts both:
- **Backend API** on `http://localhost:3001`
- **Frontend** on `http://localhost:5173`

### Start Individually
```bash
# Start backend only
npm run server

# Start frontend only
npm run client
```

## API Endpoints

### Authentication

**Register**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "myusername",
  "password": "securepassword",
  "displayName": "My Name" // optional
}

Response: UserSession
```

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "emailOrUsername": "user@example.com", // or "myusername"
  "password": "securepassword"
}

Response: UserSession
```

**Get User**
```http
GET /api/users/:id

Response: UserSession
```

### User Preferences

**Get Preferences**
```http
GET /api/users/:id/preferences

Response: UserPreferences
```

**Update Preferences**
```http
PUT /api/users/:id/preferences
Content-Type: application/json

{
  "theme": "dark",
  "viewMode": "images-only",
  "fontSize": 18
}

Response: UserPreferences
```

### Health Check
```http
GET /api/health

Response: { "status": "ok" }
```

## Environment Variables

The frontend connects to the API using:
```bash
VITE_API_URL=http://localhost:3001
```

Default: `http://localhost:3001` (if not set)

## Frontend API Client

Located at: `src/services/api/auth.api.ts`

Example usage:
```typescript
import { authApi } from '@/services/api/auth.api';

// Register
const user = await authApi.register({
  email: 'user@example.com',
  username: 'myusername',
  password: 'password123'
});

// Login
const session = await authApi.login({
  emailOrUsername: 'user@example.com',
  password: 'password123'
});

// Get user by ID
const user = await authApi.getUserById(userId);
```

## Development

### Watch Mode
The server runs in watch mode using `tsx watch`, so it automatically restarts when you make changes to `server/index.ts`.

### Debugging
Server logs appear in the terminal with the `[SERVER]` prefix.

### Port Configuration
To change the API port, set the `PORT` environment variable:
```bash
PORT=4000 npm run server
```

## Production Build

For production, you'll need to:
1. Build the frontend: `npm run build`
2. Serve the backend with a process manager (PM2, systemd, etc.)
3. Use a reverse proxy (nginx) to route requests

## Security Notes

- Passwords are hashed with bcrypt (10 rounds)
- CORS is enabled for local development
- In production, restrict CORS to your frontend domain
- Add authentication middleware for protected routes
- Consider adding rate limiting
- Use HTTPS in production

