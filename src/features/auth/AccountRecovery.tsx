import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Container } from '@/components/layouts';

export default function AccountRecovery() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ found: boolean; username?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/find-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search for account');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size="sm">
      <div className="flex min-h-[80vh] items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Find your account</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter your email address to find your username
            </p>
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

                {result && result.found && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="rounded-lg bg-green-50 p-4 dark:bg-green-950"
                  >
                    <div className="flex">
                      <svg
                        className="h-5 w-5 text-green-600 dark:text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                          Account found
                        </h3>
                        <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                          Your username is: <span className="font-semibold">{result.username}</span>
                        </p>
                        <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                          You can now use this username to log in
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {result && !result.found && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="rounded-lg bg-amber-50 p-4 dark:bg-amber-950"
                  >
                    <div className="flex">
                      <svg
                        className="h-5 w-5 text-amber-600 dark:text-amber-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                          No account found
                        </h3>
                        <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                          We couldn't find an account associated with that email address.
                        </p>
                        <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                          Make sure you entered the correct email, or create a new account.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
              >
                Find my username
              </Button>

              <div className="space-y-2 text-center text-sm">
                {result && result.found && (
                  <Button
                    type="button"
                    onClick={() => navigate({ to: '/auth' })}
                    variant="outline"
                    className="w-full"
                  >
                    Go to login
                  </Button>
                )}
                <p className="text-gray-600 dark:text-gray-400">
                  <button
                    type="button"
                    onClick={() => navigate({ to: '/auth' })}
                    className="text-primary-600 hover:underline dark:text-primary-500"
                  >
                    Back to login
                  </button>
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <button
                    type="button"
                    onClick={() => navigate({ to: '/auth/forgot-password' })}
                    className="text-primary-600 hover:underline dark:text-primary-500"
                  >
                    Forgot your password?
                  </button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}

