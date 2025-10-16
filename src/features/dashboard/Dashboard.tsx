import { useRef, useCallback, useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { ImageViewer } from '@/components/ui/ImageViewer';
import { VersionBadge } from '@/components/ui/VersionBadge';
import type { Note } from '@/components/ui/NotesPanel';
import { Container, Grid, GridItem } from '@/components/layouts';
import { usePosts } from '@/hooks/queries/usePosts';
import { useAuth } from '@/hooks/queries/useAuth';
import type { Post } from '@/services/api';

type ViewMode = 'full' | 'images-only';

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { data, isLoading, fetchNextPage, hasNextPage } = usePosts();
  const [viewMode, setViewMode] = useState<ViewMode>('full');
  const loadMoreRef = useRef(null);
  const isInView = useInView(loadMoreRef);
  const [selectedImage, setSelectedImage] = useState<Post | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());

  // Get all photo posts for navigation
  const allPhotoPosts = data?.pages.flatMap(page => 
    page.posts.filter(post => post.type === 'photo')
  ) || [];

  const currentImageIndex = selectedImage 
    ? allPhotoPosts.findIndex(post => post.id === selectedImage.id)
    : -1;

  const handleNextImage = () => {
    if (currentImageIndex < allPhotoPosts.length - 1) {
      setSelectedImage(allPhotoPosts[currentImageIndex + 1]);
    }
  };

  const handlePreviousImage = () => {
    if (currentImageIndex > 0) {
      setSelectedImage(allPhotoPosts[currentImageIndex - 1]);
    }
  };

  const handleJumpToEnd = () => {
    if (allPhotoPosts.length > 0) {
      setSelectedImage(allPhotoPosts[allPhotoPosts.length - 1]);
    }
  };

  const handleJumpToStart = () => {
    if (allPhotoPosts.length > 0) {
      setSelectedImage(allPhotoPosts[0]);
    }
  };

  const toggleLike = (postId: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const toggleSelectImage = (postId: string) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  // Generate mock notes for the selected image
  const mockNotes = useMemo((): Note[] => {
    if (!selectedImage) return [];
    
    const noteTypes: Array<'comment' | 'like' | 'reblog'> = ['comment', 'like', 'reblog'];
    const usernames = ['artlover', 'photogeek', 'tumblrfan', 'aesthetic', 'wanderlust', 'creative', 'vibes', 'mood'];
    const comments = [
      'This is amazing!',
      'Love this aesthetic 💕',
      'Wow, beautiful capture',
      'This speaks to me',
      'Obsessed with this',
      'Adding to my collection',
      'Perfect vibes',
    ];
    
    return Array.from({ length: Math.min(selectedImage.notes, 50) }, (_, i) => {
      const type = noteTypes[Math.floor(Math.random() * noteTypes.length)];
      const username = usernames[Math.floor(Math.random() * usernames.length)] + Math.floor(Math.random() * 999);
      
      return {
        id: `note-${selectedImage.id}-${i}`,
        type,
        user: {
          username,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        },
        timestamp: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000, // Random time in last week
        comment: type === 'comment' ? comments[Math.floor(Math.random() * comments.length)] : undefined,
        reblogComment: type === 'reblog' && Math.random() > 0.5 ? comments[Math.floor(Math.random() * comments.length)] : undefined,
      };
    });
  }, [selectedImage]);

  // Fetch more posts when the load more element comes into view
  const handleLoadMore = useCallback(() => {
    if (isInView && hasNextPage) {
      fetchNextPage();
    }
  }, [isInView, hasNextPage, fetchNextPage]);

  // Call handleLoadMore when isInView changes
  useCallback(() => {
    handleLoadMore();
  }, [handleLoadMore]);

  if (!currentUser) {
    return (
      <Container>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="mb-4 text-2xl font-bold">Welcome to Tumblr T3</h2>
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                Sign in to see posts from blogs you follow.
              </p>
              <div className="flex justify-center space-x-4">
                <Button 
                  variant="outline"
                  onClick={() => navigate({ to: '/auth', search: { mode: 'login' } })}
                >
                  Log in
                </Button>
                <Button
                  onClick={() => navigate({ to: '/auth', search: { mode: 'register' } })}
                >
                  Sign up
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-8">
        {/* Dashboard header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            Dashboard {viewMode === 'images-only' && '(Images Only)'}
          </h1>
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'full' ? 'images-only' : 'full')}
              className="inline-flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              title={viewMode === 'images-only' ? 'Switch to Full View' : 'Switch to Images Only'}
            >
              {viewMode === 'images-only' ? (
                <>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <span>Full View</span>
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Images Only</span>
                </>
              )}
            </button>
            <Button>Create Post</Button>
          </div>
        </div>

        {/* Posts grid */}
        {isLoading ? (
          <Grid>
            {Array.from({ length: 6 }).map((_, i) => (
              <GridItem key={i}>
                <div className="h-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
              </GridItem>
            ))}
          </Grid>
        ) : viewMode === 'images-only' ? (
          /* Images Only Mode - Terse Grid */
          <div className="grid grid-cols-2 gap-1 md:grid-cols-3 lg:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {data?.pages.map((page) =>
                page.posts
                  .filter(post => post.type === 'photo')
                  .map((post, postIndex) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: postIndex * 0.02 }}
                      className="group relative aspect-square cursor-pointer overflow-hidden bg-gray-100 dark:bg-gray-800"
                      onClick={() => setSelectedImage(post)}
                    >
                      <img
                        src={post.content}
                        alt="Post"
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                    </motion.div>
                  ))
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Full Mode - Card View */
          <Grid>
            <AnimatePresence mode="popLayout">
              {data?.pages.map((page, pageIndex) =>
                page.posts.map((post, postIndex) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: postIndex * 0.05 }}
                  >
                    <GridItem>
                      <Card>
                        <CardHeader>
                          <div className="flex items-center space-x-4">
                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800">
                              {/* Blog avatar */}
                            </div>
                            <div>
                              <h3 
                                className="font-semibold cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                onClick={() => window.open(`/blog/${post.blogId}`, '_blank')}
                              >
                                {post.blogId}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(post.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {/* Post content based on type */}
                          {post.type === 'text' && (
                            <div
                              className="prose dark:prose-invert"
                              dangerouslySetInnerHTML={{ __html: post.content }}
                            />
                          )}
                          {post.type === 'photo' && (
                            <img
                              src={post.content}
                              alt="Post"
                              className="cursor-pointer rounded-lg transition-transform hover:scale-[1.02]"
                              onClick={() => setSelectedImage(post)}
                            />
                          )}
                          {/* Add other post type renderers */}

                          {/* Post actions */}
                          <div className="mt-4 flex items-center space-x-4">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => toggleLike(post.id)}
                              className={likedPosts.has(post.id) ? 'text-red-500' : ''}
                            >
                              <svg className="mr-1 h-4 w-4" fill={likedPosts.has(post.id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              {likedPosts.has(post.id) ? 'Liked' : 'Like'}
                            </Button>
                            <Button variant="ghost" size="sm">
                              Reblog
                            </Button>
                            <span 
                              className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              onClick={() => window.open(`/blog/${post.blogId}`, '_blank')}
                            >
                              {post.notes} notes
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </GridItem>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </Grid>
        )}

        {/* Load more trigger */}
        <div
          ref={loadMoreRef}
          className="mt-8 flex justify-center"
        >
          {hasNextPage && (
            <Button
              variant="outline"
              onClick={() => fetchNextPage()}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Load more'}
            </Button>
          )}
        </div>
      </div>

      {/* Image Viewer Modal */}
      <ImageViewer
        isOpen={!!selectedImage}
        imageUrl={selectedImage?.content || ''}
        onClose={() => setSelectedImage(null)}
        onNext={currentImageIndex < allPhotoPosts.length - 1 ? handleNextImage : undefined}
        onPrevious={currentImageIndex > 0 ? handlePreviousImage : undefined}
        onJumpToEnd={handleJumpToEnd}
        onJumpToStart={handleJumpToStart}
        currentIndex={currentImageIndex}
        totalImages={allPhotoPosts.length}
        postId={selectedImage?.id}
        blogId={selectedImage?.blogId}
        totalNotes={selectedImage?.notes}
        notesList={mockNotes}
        isSelected={selectedImage ? selectedImages.has(selectedImage.id) : false}
        onToggleSelect={() => selectedImage && toggleSelectImage(selectedImage.id)}
      />
      
      <VersionBadge />
    </Container>
  );
}