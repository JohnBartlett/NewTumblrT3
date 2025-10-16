import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';

import { RootLayout } from '@/components/layouts/RootLayout';
import Dashboard from '@/features/dashboard/Dashboard';
import Profile from '@/features/profile/Profile';
import Settings from '@/features/settings/Settings';
import Search from '@/features/search/Search';
import Auth from '@/features/auth/Auth';
import { Blog } from '@/features/blog/Blog';
import { TagView } from '@/features/tag/TagView';
import { StoredImages } from '@/features/stored/StoredImages';

// Define root route
const rootRoute = createRootRoute({
  component: RootLayout,
});

// Define child routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: Dashboard,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: Profile,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: Settings,
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search',
  component: Search,
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  component: Auth,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      mode: (search.mode as string) || 'login',
    };
  },
});

const blogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/blog/$username',
  component: Blog,
});

const tagRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tag/$tag',
  component: TagView,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      scope: (search.scope as string) || 'all',
      blog: search.blog as string | undefined,
    };
  },
});

const storedImagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/stored',
  component: StoredImages,
});

// Create and export the router
const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  profileRoute,
  settingsRoute,
  searchRoute,
  authRoute,
  blogRoute,
  tagRoute,
  storedImagesRoute,
]);

export const router = createRouter({ 
  routeTree,
  defaultPreload: 'intent',
});

// Type-safe route definitions
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}