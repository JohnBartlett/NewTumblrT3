import { useState } from 'react';
import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { useAtom } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/queries/useAuth';
import { preferencesAtom } from '@/store/preferences';

export function Navigation() {
  const navigate = useNavigate();
  const { currentUser, isLoadingUser, logout } = useAuth();
  const [preferences, setPreferences] = useAtom(preferencesAtom);
  const routerState = useRouterState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    const newTheme = preferences.theme === 'dark' ? 'light' : preferences.theme === 'light' ? 'dark' : 'light';
    setPreferences({ ...preferences, theme: newTheme });
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-900/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and primary navigation */}
          <div className="flex items-center space-x-4 sm:space-x-8">
            <Link
              to="/dashboard"
              className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white"
            >
              Tumblr T3
            </Link>
            {currentUser && (
              <div className="hidden md:flex md:space-x-4">
                <Link
                  to="/search"
                  className="rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  Search
                </Link>
                <Link
                  to="/dashboard"
                  className="rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  Dashboard
                </Link>
                <Link
                  to="/stored"
                  className="rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  Stored
                </Link>
              </div>
            )}
          </div>

          {/* Secondary navigation and actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              <motion.div
                initial={false}
                animate={{
                  rotate: preferences.theme === 'dark' ? 180 : 0,
                }}
              >
                {preferences.theme === 'dark' ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                )}
              </motion.div>
            </Button>

            {/* User menu */}
            {isLoadingUser ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
            ) : currentUser ? (
              <>
                {/* Desktop menu */}
                <div className="hidden md:flex md:items-center md:space-x-4">
                  <Link
                    to="/profile"
                    className="rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                  >
                    Settings
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      logout();
                      navigate({ to: '/' });
                    }}
                  >
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </Button>
                </div>
                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Toggle mobile menu"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {mobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost"
                  size="sm"
                  className="text-sm"
                  onClick={() => navigate({ to: '/auth', search: { mode: 'login' } })}
                >
                  Log in
                </Button>
                <Button 
                  variant="primary"
                  size="sm"
                  className="text-sm"
                  onClick={() => navigate({ to: '/auth', search: { mode: 'register' } })}
                >
                  Sign up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {currentUser && mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-gray-200 dark:border-gray-800"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              <Link
                to="/search"
                onClick={closeMobileMenu}
                className="block rounded-lg px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Search
              </Link>
              <Link
                to="/dashboard"
                onClick={closeMobileMenu}
                className="block rounded-lg px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Dashboard
              </Link>
              <Link
                to="/stored"
                onClick={closeMobileMenu}
                className="block rounded-lg px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Stored
              </Link>
              <Link
                to="/profile"
                onClick={closeMobileMenu}
                className="block rounded-lg px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Profile
              </Link>
              <Link
                to="/settings"
                onClick={closeMobileMenu}
                className="block rounded-lg px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Settings
              </Link>
              <button
                onClick={() => {
                  logout();
                  closeMobileMenu();
                  navigate({ to: '/' });
                }}
                className="w-full text-left block rounded-lg px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <svg className="mr-2 h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}