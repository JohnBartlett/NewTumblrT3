import { useState, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Container } from '@/components/layouts';
import { useAuth } from '@/hooks/queries/useAuth';

interface FormData {
  email: string;
  password: string;
  username?: string;
}

export default function Auth() {
  const navigate = useNavigate();
  const searchParams = useSearch({ from: '/auth' }) as { mode?: string };
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const { login, register, isLoggingIn, isRegistering, loginError, registerError } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    username: '',
  });
  const [error, setError] = useState<string | null>(null);

  // Update mode based on URL search params
  useEffect(() => {
    if (searchParams?.mode === 'register') {
      setMode('register');
    } else {
      setMode('login');
    }
  }, [searchParams]);

  // Show errors from mutations
  useEffect(() => {
    if (loginError) {
      setError(loginError.message);
    } else if (registerError) {
      setError(registerError.message);
    }
  }, [loginError, registerError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (mode === 'login') {
        await login({
          emailOrUsername: formData.email,
          password: formData.password,
        });
        navigate({ to: '/' });
      } else {
        // Handle registration
        if (!formData.username) {
          setError('Username is required');
          return;
        }
        await register({
          email: formData.email,
          username: formData.username,
          password: formData.password,
        });
        navigate({ to: '/' });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred. Please try again.'
      );
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    navigate({ to: '/auth', search: { mode: newMode } });
  };

  return (
    <Container size="sm">
      <div className="flex min-h-[80vh] items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>
              {mode === 'login' ? 'Welcome back' : 'Create an account'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/50 dark:text-red-400"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {mode === 'register' && (
                <div className="space-y-2">
                  <label
                    htmlFor="username"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Username
                  </label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Choose a username"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {mode === 'login' ? 'Email or Username' : 'Email'}
                </label>
                <Input
                  id="email"
                  name="email"
                  type={mode === 'login' ? 'text' : 'email'}
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={mode === 'login' ? 'Enter your email or username' : 'Enter your email'}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => navigate({ to: '/auth/forgot-password' })}
                      className="text-xs text-primary-600 hover:underline dark:text-primary-500"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  minLength={mode === 'register' ? 8 : undefined}
                />
                {mode === 'register' && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Must be at least 8 characters with letters and numbers
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoggingIn || isRegistering}
              >
                {mode === 'login' ? 'Log in' : 'Sign up'}
              </Button>

              <div className="space-y-3 text-center text-sm">
                {mode === 'login' ? (
                  <>
                    <p className="text-gray-600 dark:text-gray-400">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('register')}
                        className="text-primary-600 hover:underline dark:text-primary-500"
                      >
                        Sign up
                      </button>
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <button
                        type="button"
                        onClick={() => navigate({ to: '/auth/account-recovery' })}
                        className="text-primary-600 hover:underline dark:text-primary-500"
                      >
                        Can't find your login?
                      </button>
                    </p>
                  </>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="text-primary-600 hover:underline dark:text-primary-500"
                    >
                      Log in
                    </button>
                  </p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}