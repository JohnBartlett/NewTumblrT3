import { useState } from 'react';
import { useAtom } from 'jotai';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/Sheet';
import { Container, Grid, GridItem } from '@/components/layouts';
import { useAuth } from '@/hooks/queries/useAuth';
import { userAtom } from '@/store/auth';

export default function Profile() {
  const { currentUser } = useAuth();
  const [user] = useAtom(userAtom);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  if (!user) {
    return (
      <Container>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Card>
            <CardContent className="p-8">
              <p className="text-center text-gray-600 dark:text-gray-400">
                Please log in to view your profile.
              </p>
            </CardContent>
          </Card>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="space-y-8 py-8">
        {/* Profile header */}
        <div className="relative rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 p-8 text-white">
          <div className="flex items-center space-x-6">
            <div className="h-24 w-24 overflow-hidden rounded-full bg-white/20">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-bold">
                  {user.username[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{user.username}</h1>
              <p className="mt-1 text-white/80">{user.email}</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => setIsEditingProfile(true)}
            >
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Blogs grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Your Blogs</h2>
            <Button variant="outline">Create New Blog</Button>
          </div>
          <Grid>
            {user.blogs.map((blog, index) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GridItem>
                  <Card>
                    <CardHeader>
                      <CardTitle>{blog.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {blog.description || 'No description'}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            View Blog
                          </Button>
                          <Button variant="ghost" size="sm">
                            Settings
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </GridItem>
              </motion.div>
            ))}
          </Grid>
        </div>
      </div>

      {/* Edit profile sheet */}
      <Sheet
        isOpen={isEditingProfile}
        onClose={() => setIsEditingProfile(false)}
        position="right"
      >
        <SheetHeader>
          <SheetTitle>Edit Profile</SheetTitle>
        </SheetHeader>
        <SheetContent>
          <form className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Username
              </label>
              <Input
                id="username"
                defaultValue={user.username}
                placeholder="Enter your username"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                defaultValue={user.email}
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="avatar"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Avatar URL
              </label>
              <Input
                id="avatar"
                defaultValue={user.avatar}
                placeholder="Enter avatar URL"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                type="submit"
                onClick={e => {
                  e.preventDefault();
                  setIsEditingProfile(false);
                }}
              >
                Save Changes
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsEditingProfile(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </Container>
  );
}