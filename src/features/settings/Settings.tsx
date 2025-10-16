import { useState } from 'react';
import { useAtom } from 'jotai';
import { useNavigate } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Container, Section } from '@/components/layouts';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { VersionBadge } from '@/components/ui/VersionBadge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { userAtom } from '@/store/auth';
import {
  themeModeAtom,
  fontSizeAtom,
  reducedMotionAtom,
  enableHapticsAtom,
  enableGesturesAtom,
  filenamePatternAtom,
  includeIndexInFilenameAtom,
  includeSidecarMetadataAtom,
  downloadMethodAtom,
  updatePreferencesAtom,
  type FilenamePattern,
} from '@/store/preferences';

const themeModeOptions = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'system', label: 'System' },
];

const fontSizeOptions = [
  { id: '14', label: 'Small' },
  { id: '16', label: 'Medium' },
  { id: '18', label: 'Large' },
];

export default function Settings() {
  const navigate = useNavigate();
  const [user] = useAtom(userAtom);
  const [themeMode] = useAtom(themeModeAtom);
  const [fontSize] = useAtom(fontSizeAtom);
  const [reducedMotion] = useAtom(reducedMotionAtom);
  const [enableHaptics] = useAtom(enableHapticsAtom);
  const [enableGestures] = useAtom(enableGesturesAtom);
  const [filenamePattern] = useAtom(filenamePatternAtom);
  const [includeIndex] = useAtom(includeIndexInFilenameAtom);
  const [includeSidecarMetadata] = useAtom(includeSidecarMetadataAtom);
  const [downloadMethod] = useAtom(downloadMethodAtom);
  const [, updatePreferences] = useAtom(updatePreferencesAtom);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    // Validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    if (!/[a-zA-Z]/.test(passwordForm.newPassword) || !/[0-9]/.test(passwordForm.newPassword)) {
      setPasswordError('Password must contain at least one letter and one number');
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setPasswordSuccess(true);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend verification email');
      }

      setEmailVerificationSent(true);
      setTimeout(() => setEmailVerificationSent(false), 5000);
    } catch (err) {
      console.error('Failed to resend verification:', err);
    }
  };

  return (
    <Container size="md">
      <div className="py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Customize your app experience.
            </p>
          </div>
          <button
            onClick={() => navigate({ to: '/dashboard' })}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Close settings"
            title="Close settings"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-8 space-y-6">
          {/* Appearance */}
          <Section>
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Theme
                  </label>
                  <SegmentedControl
                    options={themeModeOptions}
                    value={themeMode}
                    onChange={value =>
                      updatePreferences({ theme: value as 'light' | 'dark' | 'system' })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Font Size
                  </label>
                  <SegmentedControl
                    options={fontSizeOptions}
                    value={String(fontSize)}
                    onChange={value =>
                      updatePreferences({ fontSize: Number(value) })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* Accessibility */}
          <Section>
            <Card>
              <CardHeader>
                <CardTitle>Accessibility</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Reduced Motion
                  </label>
                  <SegmentedControl
                    options={[
                      { id: 'true', label: 'Enabled' },
                      { id: 'false', label: 'Disabled' },
                    ]}
                    value={String(reducedMotion)}
                    onChange={value =>
                      updatePreferences({ reducedMotion: value === 'true' })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* Interactions */}
          <Section>
            <Card>
              <CardHeader>
                <CardTitle>Interactions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Haptic Feedback
                  </label>
                  <SegmentedControl
                    options={[
                      { id: 'true', label: 'Enabled' },
                      { id: 'false', label: 'Disabled' },
                    ]}
                    value={String(enableHaptics)}
                    onChange={value =>
                      updatePreferences({ enableHaptics: value === 'true' })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Gesture Controls
                  </label>
                  <SegmentedControl
                    options={[
                      { id: 'true', label: 'Enabled' },
                      { id: 'false', label: 'Disabled' },
                    ]}
                    value={String(enableGestures)}
                    onChange={value =>
                      updatePreferences({ enableGestures: value === 'true' })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* Security */}
          <Section>
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Verification Status */}
                {user && !user.emailVerified && (
                  <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-950">
                    <div className="flex items-start">
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
                      <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                          Email not verified
                        </h3>
                        <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                          Please verify your email address to access all features.
                        </p>
                        {emailVerificationSent ? (
                          <p className="mt-2 text-sm font-medium text-green-700 dark:text-green-300">
                            ✓ Verification email sent! Check your inbox.
                          </p>
                        ) : (
                          <Button
                            onClick={handleResendVerification}
                            size="sm"
                            variant="outline"
                            className="mt-2"
                          >
                            Resend verification email
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Change Password Form */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Change Password
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Update your password to keep your account secure
                    </p>
                  </div>

                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <AnimatePresence mode="wait">
                      {passwordError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/50 dark:text-red-400"
                        >
                          {passwordError}
                        </motion.div>
                      )}

                      {passwordSuccess && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="rounded-lg bg-green-50 p-3 text-sm text-green-600 dark:bg-green-900/50 dark:text-green-400"
                        >
                          ✓ Password changed successfully
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Current Password
                      </label>
                      <Input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                        }
                        placeholder="Enter current password"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        New Password
                      </label>
                      <Input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                        }
                        placeholder="Enter new password"
                        minLength={8}
                        required
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Must be at least 8 characters with letters and numbers
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Confirm New Password
                      </label>
                      <Input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                        }
                        placeholder="Confirm new password"
                        minLength={8}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      isLoading={passwordLoading}
                      disabled={passwordLoading}
                    >
                      Change Password
                    </Button>
                  </form>
                </div>

                {/* Security Info */}
                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                  <div className="flex">
                    <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Password Security
                      </h3>
                      <div className="mt-1 text-xs text-blue-700 dark:text-blue-300 space-y-1">
                        <p>• Passwords are encrypted using bcrypt (12 rounds)</p>
                        <p>• Never shared with third parties</p>
                        <p>• Use a unique password for this account</p>
                        {user?.lastLoginAt && (
                          <p>• Last login: {new Date(user.lastLoginAt).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* Downloads */}
          <Section>
            <Card>
              <CardHeader>
                <CardTitle>Downloads</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Filename Pattern
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Choose how downloaded images are named
                  </p>
                  <div className="space-y-2">
                    {[
                      { value: 'blog-tags-date', label: 'Blog + Tags + Date', example: 'photoarchive_photography_landscape_2025-10-15_001.jpg' },
                      { value: 'date-blog-tags', label: 'Date + Blog + Tags', example: '2025-10-15_photoarchive_photography_landscape_001.jpg' },
                      { value: 'blog-description', label: 'Blog + Description', example: 'photoarchive_amazing_sunset_photo_2025-10-15.jpg' },
                      { value: 'tags-only', label: 'Tags Only', example: 'photography_landscape_sunset_001.jpg' },
                      { value: 'timestamp', label: 'Timestamp', example: 'photoarchive_1760549272501_1.jpg' },
                      { value: 'simple', label: 'Simple', example: 'image_001.jpg' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updatePreferences({ filenamePattern: option.value as FilenamePattern })}
                        className={`w-full rounded-lg border-2 p-3 text-left transition-colors ${
                          filenamePattern === option.value
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {option.label}
                          </span>
                          {filenamePattern === option.value && (
                            <svg className="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {option.example}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Include Index Number
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Add sequential numbers (001, 002, etc.) to filenames
                  </p>
                  <SegmentedControl
                    options={[
                      { id: 'true', label: 'Yes' },
                      { id: 'false', label: 'No' },
                    ]}
                    value={String(includeIndex)}
                    onChange={value =>
                      updatePreferences({ includeIndexInFilename: value === 'true' })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Download Method
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Choose how images are downloaded
                  </p>
                  <SegmentedControl
                    options={[
                      { id: 'client-side', label: 'Client-side (Browser)' },
                      { id: 'server-side', label: 'Server-side (Parallel)' },
                    ]}
                    value={downloadMethod}
                    onChange={value =>
                      updatePreferences({ downloadMethod: value as 'client-side' | 'server-side' })
                    }
                  />
                  <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                    <div className="flex items-start space-x-2">
                      <svg className="h-4 w-4 mt-0.5 text-gray-600 dark:text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        <strong className="text-gray-900 dark:text-gray-200">Server-side</strong> downloads use parallel fetching (like Python's asyncio/aiohttp) for faster downloads, especially on mobile. 
                        <strong className="text-gray-900 dark:text-gray-200 ml-1">Client-side</strong> uses your browser directly (may be slower for many images).
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Include Metadata Files (.txt)
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Download a .txt file with each image containing blog name, tags, description, notes, and post URL
                  </p>
                  <SegmentedControl
                    options={[
                      { id: 'true', label: 'Yes' },
                      { id: 'false', label: 'No' },
                    ]}
                    value={String(includeSidecarMetadata)}
                    onChange={value =>
                      updatePreferences({ includeSidecarMetadata: value === 'true' })
                    }
                  />
                </div>

                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                  <div className="flex">
                    <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Metadata Sidecar Files
                      </h3>
                      <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                        Each downloaded image includes a .txt file with complete metadata: blog name, tags, description, notes count, and post URL.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Section>
        </div>
      </div>
      
      <VersionBadge />
    </Container>
  );
}