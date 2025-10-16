import { useParams, useSearch, useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Button, ImageViewer, NotesPanel } from '@/components/ui';
import type { Note } from '@/components/ui/NotesPanel';

interface TagPost {
  id: string;
  type: 'text' | 'photo' | 'quote' | 'link';
  content: string;
  timestamp: number;
  notes: number;
  tags: string[];
  images?: string[];
  blogName: string;
  blogAvatar: string;
}

export function TagView() {
  const { tag } = useParams({ from: '/tag/$tag' });
  const { scope, blog } = useSearch({ from: '/tag/$tag' });
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<TagPost | null>(null);
  const [selectedPostForNotes, setSelectedPostForNotes] = useState<TagPost | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  // Generate mock posts with the tag
  const tagPosts = useMemo(() => {
    const allTags = [
      'photography', 'nature', 'landscape', 'travel', 'wanderlust',
      'aesthetic', 'vsco', 'art', 'beautiful', 'mood',
      'sunset', 'mountains', 'ocean', 'cityscape', 'architecture',
      'minimalism', 'vintage', 'retro', 'vibes', 'inspo',
      'creative', 'inspiration', 'my photos', 'original photography',
      'artists on tumblr', 'dark academia', 'cottagecore', 'light academia',
      'cozy', 'autumn', 'winter', 'spring', 'summer',
      'street photography', 'portrait', 'black and white', 'film photography',
      'digital art', 'illustration', 'design', 'creative writing',
    ];

    const numPosts = scope === 'user' ? 15 : 40;
    const blogNames = scope === 'user' && blog 
      ? [blog] 
      : ['artlover', 'photogeek', 'wanderlust85', 'aesthetic_vibes', 'creative620', 'mood_board', 'vintage_soul', 'nature_lover'];

    return Array.from({ length: numPosts }, (_, i) => {
      const isPhoto = Math.random() > 0.3;
      const blogName = scope === 'user' && blog 
        ? blog 
        : blogNames[Math.floor(Math.random() * blogNames.length)];
      
      // Include the searched tag plus random additional tags
      const shuffled = allTags.filter(t => t !== tag).sort(() => 0.5 - Math.random());
      const additionalTags = shuffled.slice(0, Math.floor(Math.random() * 3) + 1);
      const postTags = [tag, ...additionalTags];

      return {
        id: `tag-post-${scope}-${i}`,
        type: isPhoto ? 'photo' : (['text', 'quote'][Math.floor(Math.random() * 2)] as TagPost['type']),
        content: isPhoto
          ? `https://picsum.photos/seed/tag-${tag}-${i}/800/600`
          : `<p>A post about ${tag}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>`,
        timestamp: Date.now() - i * 3600000 * 2,
        notes: Math.floor(Math.random() * 2000) + 50,
        tags: postTags,
        images: isPhoto ? [`https://picsum.photos/seed/tag-${tag}-${i}/800/600`] : undefined,
        blogName,
        blogAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${blogName}`,
      };
    });
  }, [tag, scope, blog]);

  // Get all photo posts for navigation
  const allPhotoPosts = useMemo(() => {
    return tagPosts.filter(post => post.type === 'photo' && post.images);
  }, [tagPosts]);

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

  // Generate mock notes
  const generateMockNotes = (post: TagPost): Note[] => {
    const noteTypes: Array<'comment' | 'like' | 'reblog'> = ['comment', 'like', 'reblog'];
    const usernames = ['artlover', 'photogeek', 'tumblrfan', 'aesthetic', 'wanderlust', 'creative'];
    const comments = [
      'Love this!',
      'Great use of this tag 💕',
      'Perfect example',
      'This is beautiful',
      'Obsessed',
    ];

    return Array.from({ length: Math.min(post.notes, 50) }, (_, i) => {
      const type = noteTypes[Math.floor(Math.random() * noteTypes.length)];
      const user = usernames[Math.floor(Math.random() * usernames.length)] + Math.floor(Math.random() * 999);

      return {
        id: `note-${post.id}-${i}`,
        type,
        user: {
          username: user,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user}`,
        },
        timestamp: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        comment: type === 'comment' ? comments[Math.floor(Math.random() * comments.length)] : undefined,
        reblogComment: type === 'reblog' && Math.random() > 0.5 ? comments[Math.floor(Math.random() * comments.length)] : undefined,
      };
    });
  };

  const mockNotesForImage = useMemo((): Note[] => {
    if (!selectedImage) return [];
    return generateMockNotes(selectedImage);
  }, [selectedImage]);

  const mockNotesForPost = useMemo((): Note[] => {
    if (!selectedPostForNotes) return [];
    return generateMockNotes(selectedPostForNotes);
  }, [selectedPostForNotes]);

  const handleLike = (postId: string) => {
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

  const toggleScope = () => {
    if (scope === 'user' && blog) {
      navigate({ to: '/tag/$tag', params: { tag }, search: { scope: 'all' } });
    } else if (scope === 'all') {
      // Can't go back to user scope without a blog context
      // This would need to be handled differently in real implementation
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                #{tag}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {scope === 'user' && blog ? (
                  <>
                    Posts from <span className="font-semibold">{blog}</span> tagged with #{tag}
                  </>
                ) : (
                  <>All posts tagged with #{tag}</>
                )}
              </p>
            </div>

            {/* Scope Toggle */}
            {scope === 'user' && blog && (
              <Button
                variant="outline"
                onClick={toggleScope}
                size="sm"
              >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                Search All Blogs
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
            <span>{tagPosts.length} posts</span>
            {scope === 'all' && <span>From {new Set(tagPosts.map(p => p.blogName)).size} blogs</span>}
          </div>
        </motion.div>

        {/* Posts Grid - Similar to dashboard */}
        <div className="space-y-4">
          {tagPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <div className="p-6">
                  {/* Blog header */}
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={post.blogAvatar}
                        alt={post.blogName}
                        className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"
                      />
                      <div>
                        <button
                          onClick={() => navigate({ to: '/blog/$username', params: { username: post.blogName } })}
                          className="font-semibold text-gray-900 hover:text-primary-500 dark:text-white dark:hover:text-primary-400"
                        >
                          {post.blogName}
                        </button>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(post.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Post image */}
                  {post.images && post.images.length > 0 && (
                    <img
                      src={post.images[0]}
                      alt="Post content"
                      className="mb-4 w-full cursor-pointer rounded-lg transition-transform hover:scale-[1.02]"
                      onClick={() => setSelectedImage(post)}
                    />
                  )}

                  {/* Post content */}
                  {!post.images && (
                    <div
                      className="prose dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                  )}

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.tags.map(postTag => (
                        <button
                          key={postTag}
                          onClick={() => {
                            if (scope === 'user' && blog) {
                              navigate({ to: '/tag/$tag', params: { tag: postTag }, search: { scope: 'user', blog } });
                            } else {
                              navigate({ to: '/tag/$tag', params: { tag: postTag }, search: { scope: 'all' } });
                            }
                          }}
                          className={`rounded-full px-3 py-1 text-sm transition-colors ${
                            postTag === tag
                              ? 'bg-primary-500 text-white dark:bg-primary-600'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          #{postTag}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Post actions */}
                  <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center space-x-1 transition-colors ${
                        likedPosts.has(post.id)
                          ? 'text-red-500 hover:text-red-600'
                          : 'hover:text-primary-500'
                      }`}
                    >
                      <svg
                        className="h-5 w-5"
                        fill={likedPosts.has(post.id) ? 'currentColor' : 'none'}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <span>Like</span>
                    </button>
                    <button
                      onClick={() => setSelectedPostForNotes(post)}
                      className="flex items-center space-x-1 transition-colors hover:text-primary-500"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <span>Comment</span>
                    </button>
                    <button className="flex items-center space-x-1 transition-colors hover:text-primary-500">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      <span>Reblog</span>
                    </button>
                    <button
                      onClick={() => setSelectedPostForNotes(post)}
                      className="ml-auto transition-colors hover:text-primary-500 hover:underline"
                    >
                      {post.notes} notes
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Image Viewer */}
        {selectedImage && selectedImage.images && (
          <ImageViewer
            imageUrl={selectedImage.images[0]}
            isOpen={!!selectedImage}
            onClose={() => setSelectedImage(null)}
            onNext={currentImageIndex < allPhotoPosts.length - 1 ? handleNextImage : undefined}
            onPrevious={currentImageIndex > 0 ? handlePreviousImage : undefined}
            blogId={selectedImage.blogName}
            totalNotes={selectedImage.notes}
            notesList={mockNotesForImage}
          />
        )}

        {/* Notes Panel */}
        <NotesPanel
          isOpen={!!selectedPostForNotes}
          onClose={() => setSelectedPostForNotes(null)}
          notes={mockNotesForPost}
          totalNotes={selectedPostForNotes?.notes || 0}
        />
      </div>
    </div>
  );
}

