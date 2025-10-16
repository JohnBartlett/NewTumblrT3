import { useState, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Container } from '@/components/layouts';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const searchParams = useSearch({ from: '/auth/verify-email' }) as { token?: string };
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!searchParams?.token) {
        setStatus('error');
        setError('Invalid or missing verification token');
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: searchParams.token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to verify email');
        }

        setStatus('success');
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <Container size="sm">
      <div className="flex min-h-[80vh] items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Email Verification</CardTitle>
          </CardHeader>
          <CardContent>
            {status === 'loading' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center space-y-4 py-8"
              >
                <LoadingSpinner size="lg" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Verifying your email...
                </p>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950">
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
                        Email verified successfully!
                      </h3>
                      <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                        Your email has been verified. You can now access all features of your account.
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => navigate({ to: '/' })}
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/50">
                  <div className="flex">
                    <svg
                      className="h-5 w-5 text-red-600 dark:text-red-400"
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
                      <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                        Verification failed
                      </h3>
                      <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                        {error || 'Unable to verify your email. The link may be invalid or expired.'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => navigate({ to: '/settings' })}
                    className="flex-1"
                    variant="outline"
                  >
                    Resend verification
                  </Button>
                  <Button
                    onClick={() => navigate({ to: '/' })}
                    className="flex-1"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}

