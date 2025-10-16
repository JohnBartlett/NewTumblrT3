# Tumblr T3 - Modern Tumblr Web Client

A modern, feature-rich Tumblr client built with React, TypeScript, and Vite, following Apple's Human Interface Guidelines.

## 🚀 Features

### Core Functionality
- ✅ **Modern Web Application** - React 18 + TypeScript + Vite
- ✅ **Progressive Web App (PWA)** - Installable with offline support
- ✅ **Responsive Design** - Optimized for mobile, tablet, and desktop
- ✅ **Dark Mode** - System-aware theme switching
- ✅ **Real-time Dashboard** - Infinite scrolling post feed
- ✅ **Advanced Search** - Full-text search with filters and history
- ✅ **Multi-blog Management** - Manage multiple Tumblr blogs
- ✅ **Authentication** - OAuth and direct authentication support

### UI/UX
- Apple Human Interface Guidelines compliance
- Smooth animations and transitions
- Gesture controls support
- Keyboard navigation
- Accessibility (WCAG 2.1 AA)
- Reduced motion support
- Haptic feedback

### Technical Features
- **State Management** - Jotai for atomic state
- **Data Fetching** - TanStack Query with caching
- **Routing** - TanStack Router with lazy loading
- **Styling** - Tailwind CSS with custom design system
- **Type Safety** - Strict TypeScript configuration
- **Code Quality** - ESLint, Prettier, Husky pre-commit hooks

## 📦 Tech Stack

### Core
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite 5** - Build tool and dev server

### State & Data
- **Jotai** - Atomic state management
- **TanStack Query** - Server state management
- **TanStack Router** - Type-safe routing

### UI & Styling
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Animations
- **class-variance-authority** - Component variants
- **@use-gesture/react** - Gesture handling

### PWA & Offline
- **Workbox** - Service worker management
- **LocalStorage** - Client-side persistence

### Development
- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **Storybook** - Component development
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks

## 🛠️ Installation

### Prerequisites
- **Node.js** 18+ and npm
- **PostgreSQL** 14+ (local or cloud instance)

### Setup Steps

```bash
# Clone the repository
git clone <repository-url>
cd NewTumblrT3

# Install dependencies
npm install

# Set up PostgreSQL database
# On macOS:
brew install postgresql@15
brew services start postgresql@15
createdb tumblr_dev

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/tumblr_dev"

# Run database migrations
npm run db:migrate

# Seed database with test data
npm run db:seed

# Start development server
npm run dev
```

### Database Test Accounts
After seeding, you can login with:
- **Admin**: `admin@tumblr.local` / `Admin123!`
- **Test User**: `testuser` / `Test123!`
- **Moderator**: `moderator` / `Mod123!`

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start dev server (http://localhost:5173)

# Database
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with test data
npm run db:reset     # Reset database (⚠️ deletes all data)
npm run db:studio    # Open Prisma Studio (database GUI)

# Building
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier

# Testing
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests

# Storybook
npm run storybook    # Start Storybook dev server
npm run build-storybook  # Build Storybook
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layouts/        # Layout components
│   ├── navigation/     # Navigation components
│   └── ui/            # Base UI components (Button, Input, etc.)
├── features/           # Feature-based modules
│   ├── auth/          # Authentication
│   ├── dashboard/     # Dashboard feed
│   ├── profile/       # User profile
│   ├── search/        # Search functionality
│   └── settings/      # App settings
├── hooks/             # Custom React hooks
│   └── queries/       # TanStack Query hooks
├── routes/            # Route definitions
├── services/          # API services
│   └── api/          # API client and endpoints
├── store/             # Jotai atoms and state
├── styles/            # Global styles
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## 🎨 Design System

### Colors
- **Primary**: Blue (Tumblr brand)
- **Secondary**: Purple
- **Neutral**: Gray scale
- **Semantic**: Success, Warning, Error

### Typography
- **Font**: System font stack (-apple-system, BlinkMacSystemFont)
- **Sizes**: Responsive scaling (14px - 18px base)
- **Weights**: Regular (400), Medium (500), Semibold (600), Bold (700)

### Spacing
- **Scale**: 4px base unit
- **Breakpoints**: 
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

## 🔐 Environment Variables

See `.env.example` for all available environment variables:

```env
# API Configuration
VITE_TUMBLR_API_KEY=your_api_key_here
VITE_TUMBLR_API_SECRET=your_api_secret_here

# Authentication
VITE_AUTH_METHOD=direct

# Feature Flags
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_PUSH_NOTIFICATIONS=true

# UI/UX
VITE_THEME_MODE=system
VITE_ENABLE_HAPTICS=true
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
npm run test:e2e
```

## 📱 PWA Features

- **Offline Support** - Works without internet connection
- **Installable** - Add to home screen
- **Background Sync** - Sync data when connection returns
- **Push Notifications** - Receive updates (when enabled)
- **Cache Strategy** - Stale-while-revalidate for optimal performance

## ♿ Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader optimized
- High contrast mode
- Reduced motion support
- Focus management
- ARIA attributes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Tumblr API
- React Team
- TanStack Team
- Tailwind CSS Team
- All open source contributors

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using modern web technologies