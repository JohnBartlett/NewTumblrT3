import { useParams, useNavigate } from '@tanstack/react-router';
import { useMemo, useState, useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { motion } from 'framer-motion';
import { Card, Button, ImageViewer, NotesPanel, VersionBadge, SelectionToolbar, ImageFilters, type ImageFiltersState } from '@/components/ui';
import type { Note } from '@/components/ui/NotesPanel';
import { shareImages, downloadImages, downloadImagesServerSide, canShareFiles, getImageFilename, type ImageMetadata } from '@/utils/imageDownload';
import { filenamePatternAtom, includeIndexInFilenameAtom, includeSidecarMetadataAtom, downloadMethodAtom, gridColumnsAtom, gridImageSizeAtom, updatePreferencesAtom } from '@/store/preferences';
import { userAtom } from '@/store/auth';

// Dynamic API URL based on current host
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:3001`;
  }
  return 'http://localhost:3001';
};
const API_URL = getApiUrl();

interface BlogPost {
  id: string;
  type: 'text' | 'photo' | 'quote' | 'link';
  content: string;
  timestamp: number;
  notes: number;
  tags: string[];
  images?: string[];
  imageWidth?: number;
  imageHeight?: number;
}

export function Blog() {
  const { username } = useParams({ from: '/blog/$username' });
  const navigate = useNavigate();
  const [user] = useAtom(userAtom);
  const [viewMode, setViewMode] = useState<'all' | 'images-only'>('all');
  const [filenamePattern] = useAtom(filenamePatternAtom);
  const [includeIndex] = useAtom(includeIndexInFilenameAtom);
  const [includeSidecarMetadata] = useAtom(includeSidecarMetadataAtom);
  const [downloadMethod] = useAtom(downloadMethodAtom);
  const [gridColumns] = useAtom(gridColumnsAtom);
  const [gridImageSize] = useAtom(gridImageSizeAtom);
  const [, updatePreferences] = useAtom(updatePreferencesAtom);
  const [selectedImage, setSelectedImage] = useState<BlogPost | null>(null);
  const [selectedPostForNotes, setSelectedPostForNotes] = useState<BlogPost | null>(null);
  const [notesFilter, setNotesFilter] = useState<'all' | 'comments' | 'likes' | 'reblogs'>('all');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [isFollowing, setIsFollowing] = useState(false);
  const [gridSelection, setGridSelection] = useState<Set<string>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [isFilterSticky, setIsFilterSticky] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);
  const [imageFilters, setImageFilters] = useState<ImageFiltersState>({
    sizes: new Set<string>(),
    dates: new Set<string>(),
    sort: 'recent',
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{ current: number; total: number } | null>(null);
  const [isStoring, setIsStoring] = useState(false);
  
  // Range selection mode for mobile
  const [rangeMode, setRangeMode] = useState(false);
  const [rangeStart, setRangeStart] = useState<number | null>(null);

  // Mock blog data
  const blogData = useMemo(() => {
    // Special handling for photoarchive - generate hundreds of images
    const isPhotoArchive = username === 'photoarchive';
    const postCount = isPhotoArchive ? 300 : 30;
    
    return {
      username,
      displayName: isPhotoArchive ? 'Photo Archive 📸' : (username.charAt(0).toUpperCase() + username.slice(1)),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      description: isPhotoArchive 
        ? 'A massive collection of curated photography from around the world. Featuring landscapes, portraits, architecture, nature, and urban photography. Perfect for inspiration and testing!'
        : `This is ${username}'s blog. A collection of thoughts, photos, and creative content.`,
      followerCount: isPhotoArchive ? 45238 : Math.floor(Math.random() * 10000),
      followingCount: isPhotoArchive ? 892 : Math.floor(Math.random() * 1000),
      postCount: isPhotoArchive ? 8547 : Math.floor(Math.random() * 500) + 50,
      posts: Array.from({ length: postCount }, (_, i) => {
        // For photoarchive, ALL posts are photos. For others, 60% photos, 40% text/other
        const isPhoto = isPhotoArchive ? true : (Math.random() > 0.4);
        
        // Varied realistic tags
        const allTags = [
          'photography', 'nature', 'landscape', 'travel', 'wanderlust',
          'aesthetic', 'vsco', 'art', 'beautiful', 'stunning',
          'sunset', 'mountains', 'ocean', 'cityscape', 'architecture',
          'minimalism', 'vintage', 'retro', 'mood', 'vibes',
          'creative', 'inspiration', 'my photos', 'original photography',
          'artists on tumblr', 'dark academia', 'cottagecore', 'light academia',
          'cozy', 'autumn', 'winter', 'spring', 'summer',
          'street photography', 'portrait', 'black and white', 'film photography',
          'digital art', 'sketch', 'illustration', 'design',
        ];
        
        // Select 2-5 random tags
        const shuffled = [...allTags].sort(() => 0.5 - Math.random());
        const selectedTags = shuffled.slice(0, Math.floor(Math.random() * 4) + 2);
        
        // Use varied image sizes for photoarchive
        const imageWidth = isPhotoArchive ? [800, 1000, 1200][i % 3] : 800;
        const imageHeight = isPhotoArchive ? [600, 800, 900][i % 3] : 600;
        
        return {
          id: `post-${username}-${i}`,
          type: isPhoto ? 'photo' : (['text', 'quote', 'link'][Math.floor(Math.random() * 3)] as BlogPost['type']),
          content: isPhotoArchive 
            ? `Photo ${i + 1} - ${selectedTags.slice(0, 2).join(', ')}`
            : `This is post #${i + 1} from ${username}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
          timestamp: Date.now() - i * 86400000,
          notes: isPhotoArchive ? Math.floor(Math.random() * 5000) : Math.floor(Math.random() * 1000),
          tags: selectedTags,
          images: isPhoto ? [`https://picsum.photos/seed/${username}-${i}/${imageWidth}/${imageHeight}`] : undefined,
          imageWidth: isPhoto ? imageWidth : undefined,
          imageHeight: isPhoto ? imageHeight : undefined,
        };
      }),
    };
  }, [username]);

  // Filter posts based on view mode
  const displayedPosts = useMemo(() => {
    if (viewMode === 'images-only') {
      return blogData.posts.filter(post => post.type === 'photo' && post.images);
    }
    return blogData.posts;
  }, [blogData.posts, viewMode]);

  // Get all photo posts for navigation in ImageViewer
  const allPhotoPosts = useMemo(() => {
    return blogData.posts.filter(post => post.type === 'photo' && post.images);
  }, [blogData.posts]);

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

  // Grid selection handlers
  const handleGridImageClick = (post: BlogPost, index: number, event: React.MouseEvent) => {
    const photoPosts = filteredAndSortedPhotoPosts;
    
    // Range Mode (mobile-friendly)
    if (rangeMode) {
      if (rangeStart === null) {
        // First tap - set range start
        setRangeStart(index);
        const newSelection = new Set(gridSelection);
        newSelection.add(post.id);
        setGridSelection(newSelection);
      } else {
        // Second tap - select range and exit mode
        const start = Math.min(rangeStart, index);
        const end = Math.max(rangeStart, index);
        const newSelection = new Set(gridSelection);
        for (let i = start; i <= end; i++) {
          newSelection.add(photoPosts[i].id);
        }
        setGridSelection(newSelection);
        setRangeMode(false);
        setRangeStart(null);
        setLastSelectedIndex(index);
      }
      return;
    }
    
    if (event.shiftKey && lastSelectedIndex !== null) {
      // Range selection (desktop)
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      const newSelection = new Set(gridSelection);
      for (let i = start; i <= end; i++) {
        newSelection.add(photoPosts[i].id);
      }
      setGridSelection(newSelection);
    } else if (event.ctrlKey || event.metaKey) {
      // Toggle individual
      const newSelection = new Set(gridSelection);
      if (newSelection.has(post.id)) {
        newSelection.delete(post.id);
      } else {
        newSelection.add(post.id);
      }
      setGridSelection(newSelection);
      setLastSelectedIndex(index);
    } else {
      // Normal click - open image
      setSelectedImage(post);
    }
  };

  const handleSelectAll = () => {
    setGridSelection(new Set(filteredAndSortedPhotoPosts.map(p => p.id)));
  };

  const handleSelectNone = () => {
    setGridSelection(new Set());
    setLastSelectedIndex(null);
  };

  const handleInvertSelection = () => {
    const allIds = new Set(filteredAndSortedPhotoPosts.map(p => p.id));
    const newSelection = new Set<string>();
    allIds.forEach(id => {
      if (!gridSelection.has(id)) {
        newSelection.add(id);
      }
    });
    setGridSelection(newSelection);
  };

  const handleShare = async () => {
    if (gridSelection.size === 0 || isDownloading) return;

    setIsDownloading(true);
    setDownloadProgress({ current: 0, total: gridSelection.size });

    try {
      // Get the selected posts
      const selectedPosts = allPhotoPosts.filter(post => gridSelection.has(post.id));
      
      // Prepare image data with full metadata and filename options
      const imagesToShare = selectedPosts.map((post, index) => {
        const metadata: ImageMetadata = {
          blogName: username,
          blogUrl: `https://tumblr.com/${username}`,
          tags: post.tags,
          notes: post.notes,
          timestamp: post.timestamp,
          description: post.content,
          postUrl: `https://tumblr.com/${username}/post/${post.id}`,
        };

        return {
          url: post.images![0],
          filename: getImageFilename(post.images![0], index, username),
          metadata,
          options: {
            pattern: filenamePattern,
            includeIndex: includeIndex,
          },
        };
      });

      // Share images with metadata (to Photos app)
      const result = await shareImages(
        imagesToShare,
        (current, total) => {
          setDownloadProgress({ current, total });
        }
      );

      setDownloadProgress(null);
      setIsDownloading(false);

      // Show result
      if (result.succeeded === 0 && result.failed === 0) {
        // User cancelled
        return;
      }
      
      if (result.failed === 0) {
        alert(`✅ Successfully shared ${result.succeeded} image(s) to Photos!\n\nMetadata included:\n• Blog name: ${username}\n• Tags\n• Post date\n• Notes count`);
      } else {
        alert(
          `Shared ${result.succeeded} image(s).\n${result.failed} failed.\n\nNote: Some browsers may block multiple shares.`
        );
      }
    } catch (error) {
      setDownloadProgress(null);
      setIsDownloading(false);
      alert(`❌ Share failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDownload = async () => {
    if (gridSelection.size === 0 || isDownloading) return;

    setIsDownloading(true);
    setDownloadProgress({ current: 0, total: gridSelection.size });

    try {
      // Get the selected posts - use allPhotoPosts to include ALL selected images
      const selectedPosts = allPhotoPosts.filter(post => gridSelection.has(post.id));
      
      // Prepare image data with full metadata and filename options
      const imagesToDownload = selectedPosts.map((post, index) => {
        const metadata: ImageMetadata = {
          blogName: username,
          blogUrl: `https://tumblr.com/${username}`,
          tags: post.tags,
          notes: post.notes,
          timestamp: post.timestamp,
          description: post.content,
          postUrl: `https://tumblr.com/${username}/post/${post.id}`,
        };

        return {
          url: post.images![0],
          filename: getImageFilename(post.images![0], index, username),
          metadata,
          options: {
            pattern: filenamePattern,
            includeIndex: includeIndex,
          },
        };
      });

      // Download images using selected method
      const downloadFn = downloadMethod === 'server-side' ? downloadImagesServerSide : downloadImages;
      console.log(`[Download] Using ${downloadMethod} method for ${imagesToDownload.length} images`);
      
      const result = await downloadFn(
        imagesToDownload,
        (current, total) => {
          setDownloadProgress({ current, total });
        },
        includeSidecarMetadata
      );

      setDownloadProgress(null);
      setIsDownloading(false);

      // Show result
      if (result.failed === 0) {
        alert(`✅ Successfully downloaded ${result.succeeded} image(s)!\n\nEach download includes:\n• Image file with descriptive name\n• .txt metadata file with:\n  - Blog name & URL\n  - Tags\n  - Post date\n  - Description\n  - Notes count\n  - Post URL`);
      } else {
        alert(
          `Downloaded ${result.succeeded} image(s).\n${result.failed} failed.\n\nNote: Some browsers may block multiple downloads. Check your browser's download settings.`
        );
      }
    } catch (error) {
      setDownloadProgress(null);
      setIsDownloading(false);
      alert(`❌ Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDelete = () => {
    if (confirm(`Delete ${gridSelection.size} image(s)?`)) {
      alert('Delete functionality coming soon!');
      // TODO: Implement actual delete logic
    }
  };

  const handleStore = async () => {
    if (gridSelection.size === 0 || !user?.id) {
      console.log('Store blocked - gridSelection:', gridSelection.size, 'user:', user?.id);
      return;
    }

    setIsStoring(true);

    try {
      console.log('=== STORE DEBUG START ===');
      console.log('All photo posts count:', allPhotoPosts.length);
      console.log('Grid selection size:', gridSelection.size);
      console.log('Grid selection IDs:', Array.from(gridSelection));
      
      // Get the selected posts - use allPhotoPosts to include ALL selected images regardless of current filters
      const selectedPosts = allPhotoPosts.filter(post => gridSelection.has(post.id));
      console.log('Selected posts after filter:', selectedPosts.length);
      console.log('Selected post IDs:', selectedPosts.map(p => p.id));
      
      // Prepare data for storing
      const imagesToStore = selectedPosts.map(post => ({
        postId: post.id,
        blogName: username || 'unknown',
        url: post.images![0],
        width: post.imageWidth || null,
        height: post.imageHeight || null,
        tags: post.tags,
        timestamp: post.timestamp,
        description: post.content,
        notes: post.notes,
      }));

      console.log('Storing images:', imagesToStore);
      console.log('User ID:', user.id);
      console.log('Selected posts count:', selectedPosts.length);
      console.log('Images to store count:', imagesToStore.length);
      
      // Call API to store images in database
      const response = await fetch(`${API_URL}/api/stored-images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          images: imagesToStore,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to store images');
      }

      const result = await response.json();
      
      console.log('Store result:', result);
      
      const message = [
        `✅ Stored: ${result.stored}`,
        result.skipped > 0 ? `⏭️  Skipped (already stored): ${result.skipped}` : '',
        result.failed > 0 ? `❌ Failed: ${result.failed}` : '',
        `📊 Total selected: ${imagesToStore.length}`
      ].filter(Boolean).join('\n');
      
      if (result.errors && result.errors.length > 0) {
        console.error('Storage errors:', result.errors);
      }
      
      alert(message);
      
      // Clear selection after storing
      setGridSelection(new Set());
    } catch (error) {
      console.error('Store error:', error);
      alert(`❌ Failed to store images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsStoring(false);
    }
  };

  const handleToggleSize = (size: string) => {
    setImageFilters(prev => {
      const newSizes = new Set(prev.sizes);
      if (newSizes.has(size)) {
        newSizes.delete(size);
      } else {
        newSizes.add(size);
      }
      return { ...prev, sizes: newSizes };
    });
  };

  const handleToggleDate = (date: string) => {
    setImageFilters(prev => {
      const newDates = new Set(prev.dates);
      if (newDates.has(date)) {
        newDates.delete(date);
      } else {
        newDates.add(date);
      }
      return { ...prev, dates: newDates };
    });
  };

  const handleSetSort = (sort: 'recent' | 'popular' | 'oldest') => {
    setImageFilters(prev => ({ ...prev, sort }));
  };

  const handleClearAllFilters = () => {
    setImageFilters({
      sizes: new Set(),
      dates: new Set(),
      sort: 'recent',
    });
  };

  const handleGridColumnsChange = (columns: number) => {
    updatePreferences({ gridColumns: columns });
  };

  const handleGridImageSizeChange = (size: 'compact' | 'comfortable' | 'spacious') => {
    updatePreferences({ gridImageSize: size });
  };

  // Filter and sort photo posts
  const filteredAndSortedPhotoPosts = useMemo(() => {
    let posts = allPhotoPosts;

    // Filter by size (multi-select)
    if (imageFilters.sizes.size > 0) {
      posts = posts.filter(post => {
        const width = post.imageWidth || 0;
        const height = post.imageHeight || 0;
        
        // Map actual dimensions to size categories
        // Test images are: 800×600 (small), 1000×800 (medium), 1200×900 (large)
        let postSize: string;
        if (width === 800 && height === 600) {
          postSize = 'small';
        } else if (width === 1000 && height === 800) {
          postSize = 'medium';
        } else if (width === 1200 && height === 900) {
          postSize = 'large';
        } else {
          postSize = 'medium'; // default
        }
        
        return imageFilters.sizes.has(postSize);
      });
    }

    // Filter by date (multi-select)
    if (imageFilters.dates.size > 0) {
      const now = Date.now();
      posts = posts.filter(post => {
        const age = now - post.timestamp;
        const oneDay = 86400000;
        
        // Check if post matches any selected date filter
        for (const dateFilter of imageFilters.dates) {
          switch (dateFilter) {
            case 'today':
              if (age < oneDay) return true;
              break;
            case 'this-week':
              if (age < oneDay * 7) return true;
              break;
            case 'this-month':
              if (age < oneDay * 30) return true;
              break;
          }
        }
        return false;
      });
    }

    // Sort
    posts = [...posts].sort((a, b) => {
      switch (imageFilters.sort) {
        case 'recent': return b.timestamp - a.timestamp;
        case 'oldest': return a.timestamp - b.timestamp;
        case 'popular': return b.notes - a.notes;
        default: return 0;
      }
    });

    return posts;
  }, [allPhotoPosts, imageFilters]);

  // Initialize focused index when entering Images Only mode
  useEffect(() => {
    if (viewMode === 'images-only' && focusedIndex === null && filteredAndSortedPhotoPosts.length > 0) {
      setFocusedIndex(0);
    }
  }, [viewMode, focusedIndex, filteredAndSortedPhotoPosts.length]);

  // Scroll focused element into view
  useEffect(() => {
    if (viewMode !== 'images-only' || focusedIndex === null) return;
    
    // Find the focused element and scroll it into view
    const focusedElement = document.querySelector(`[data-grid-index="${focusedIndex}"]`);
    if (focusedElement) {
      focusedElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    }
  }, [focusedIndex, viewMode]);

  // Keyboard navigation for grid
  useEffect(() => {
    if (viewMode !== 'images-only' || !gridRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const photoPosts = filteredAndSortedPhotoPosts;
      const cols = window.innerWidth >= 1024 ? 4 : window.innerWidth >= 768 ? 3 : 2;

      switch (e.key) {
        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setFocusedIndex(photoPosts.length - 1);
          break;
        case 'PageUp':
          e.preventDefault();
          setFocusedIndex(prev => Math.max(0, prev - cols * 3));
          break;
        case 'PageDown':
          e.preventDefault();
          setFocusedIndex(prev => Math.min(photoPosts.length - 1, prev + cols * 3));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => Math.max(0, prev - cols));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => Math.min(photoPosts.length - 1, prev + cols));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedIndex(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setFocusedIndex(prev => Math.min(photoPosts.length - 1, prev + 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (photoPosts[focusedIndex]) {
            setSelectedImage(photoPosts[focusedIndex]);
          }
          break;
        case ' ':
          e.preventDefault();
          if (photoPosts[focusedIndex]) {
            const newSelection = new Set(gridSelection);
            const id = photoPosts[focusedIndex].id;
            if (newSelection.has(id)) {
              newSelection.delete(id);
            } else {
              newSelection.add(id);
            }
            setGridSelection(newSelection);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, focusedIndex, filteredAndSortedPhotoPosts, gridSelection]);

  // Generate mock notes for a post
  const generateMockNotes = (post: BlogPost): Note[] => {
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

  // Generate mock notes for the selected image
  const mockNotesForImage = useMemo((): Note[] => {
    if (!selectedImage) return [];
    return generateMockNotes(selectedImage);
  }, [selectedImage]);

  // Generate mock notes for the selected post
  const mockNotesForPost = useMemo((): Note[] => {
    if (!selectedPostForNotes) return [];
    return generateMockNotes(selectedPostForNotes);
  }, [selectedPostForNotes]);

  // Handle like toggle
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Blog Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-8"
        >
          <Card>
            <div className="flex items-start space-x-3 p-4 sm:space-x-6 sm:p-6">
              <img
                src={blogData.avatar}
                alt={blogData.username}
                className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 sm:h-24 sm:w-24"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-3xl truncate">
                      {blogData.displayName}
                    </h1>
                    <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400 sm:mt-1 truncate">@{blogData.username}</p>
                  </div>
                  
                  {/* Follow button */}
                  <Button
                    onClick={() => setIsFollowing(!isFollowing)}
                    variant={isFollowing ? "outline" : "primary"}
                    size="sm"
                    className={`flex-shrink-0 ${isFollowing ? "border-primary-500 text-primary-600 dark:text-primary-400" : ""}`}
                  >
                    <svg className="h-4 w-4 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {isFollowing ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      )}
                    </svg>
                    <span className="hidden sm:inline">{isFollowing ? 'Following' : 'Follow'}</span>
                  </Button>
                </div>
                
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-2 sm:mt-4 sm:text-base sm:line-clamp-none">{blogData.description}</p>
                <div className="mt-2 flex space-x-4 text-xs sm:mt-4 sm:space-x-6 sm:text-sm">
                  <button 
                    className="cursor-pointer transition-colors hover:text-primary-500 dark:hover:text-primary-400"
                    onClick={() => {
                      // Scroll to posts section
                      document.querySelector('#posts-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    title="View posts"
                  >
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {blogData.postCount}
                    </span>
                    <span className="ml-1 text-gray-600 dark:text-gray-400">posts</span>
                  </button>
                  <button 
                    className="cursor-pointer transition-colors hover:text-primary-500 dark:hover:text-primary-400"
                    onClick={() => {
                      // TODO: Open followers modal/page
                      alert(`Followers list for ${username} - Coming soon!`);
                    }}
                    title="View followers"
                  >
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {blogData.followerCount.toLocaleString()}
                    </span>
                    <span className="ml-1 text-gray-600 dark:text-gray-400">followers</span>
                  </button>
                  <button 
                    className="cursor-pointer transition-colors hover:text-primary-500 dark:hover:text-primary-400"
                    onClick={() => {
                      // TODO: Open following modal/page
                      alert(`Following list for ${username} - Coming soon!`);
                    }}
                    title="View following"
                  >
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {blogData.followingCount}
                    </span>
                    <span className="ml-1 text-gray-600 dark:text-gray-400">following</span>
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* View Mode Toggle */}
        <div id="posts-section" className="mb-4 flex items-center justify-between gap-2 sm:mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
            Posts {viewMode === 'images-only' && <span className="hidden sm:inline">(Images Only)</span>}
          </h2>
          <Button
            variant={viewMode === 'images-only' ? 'primary' : 'outline'}
            onClick={(e) => {
              e.preventDefault();
              setViewMode(viewMode === 'all' ? 'images-only' : 'all');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              setViewMode(viewMode === 'all' ? 'images-only' : 'all');
            }}
            size="sm"
            className="flex-shrink-0 active:scale-95"
          >
            {viewMode === 'images-only' ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span className="text-xs sm:text-sm">Full View</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs sm:text-sm">Images Only</span>
              </div>
            )}
          </Button>
        </div>

        {/* Blog Posts */}
        {viewMode === 'images-only' ? (
          /* Images Only Mode - Grid with Selection */
          <div className="space-y-4">
            {/* Selection Toolbar */}
            <SelectionToolbar
              selectedCount={gridSelection.size}
              totalCount={filteredAndSortedPhotoPosts.length}
              onSelectAll={handleSelectAll}
              onSelectNone={handleSelectNone}
              onInvertSelection={handleInvertSelection}
              onShare={handleShare}
              onDownload={handleDownload}
              onStore={handleStore}
              onDelete={handleDelete}
              isDownloading={isDownloading}
              downloadProgress={downloadProgress}
              canShare={canShareFiles()}
              isStoring={isStoring}
              rangeMode={rangeMode}
              onToggleRangeMode={() => {
                setRangeMode(!rangeMode);
                setRangeStart(null);
              }}
              rangeStart={rangeStart}
            />

            {/* Filters Bar - Top Position with Sticky Toggle */}
            <div
              className={`${
                isFilterSticky
                  ? 'sticky top-32 z-10 bg-white/95 backdrop-blur-sm shadow-md dark:bg-gray-900/95'
                  : 'relative'
              } rounded-lg border border-gray-200 p-2 transition-all dark:border-gray-800 sm:p-4`}
            >
              <div className="flex items-start justify-between gap-2 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <ImageFilters
                    filters={imageFilters}
                    onToggleSize={handleToggleSize}
                    onToggleDate={handleToggleDate}
                    onSetSort={handleSetSort}
                    onClearAll={handleClearAllFilters}
                    gridColumns={gridColumns}
                    onGridColumnsChange={handleGridColumnsChange}
                    gridImageSize={gridImageSize}
                    onGridImageSizeChange={handleGridImageSizeChange}
                  />
                </div>
                
                {/* Sticky Toggle Button - Larger for mobile */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsFilterSticky(prev => !prev);
                  }}
                  className={`flex-shrink-0 rounded-lg p-2.5 transition-all active:scale-95 sm:p-2 touch-manipulation ${
                    isFilterSticky
                      ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-500 dark:bg-primary-900/30 dark:text-primary-400 dark:ring-primary-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                  title={isFilterSticky ? 'Unlock filters (scroll with page)' : 'Lock filters (keep visible)'}
                  aria-label={isFilterSticky ? 'Unlock filters' : 'Lock filters'}
                >
                  {isFilterSticky ? (
                    // Locked - filters stay at top
                    <svg className="h-5 w-5 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  ) : (
                    // Unlocked - filters scroll with page
                    <svg className="h-5 w-5 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Image Grid */}
            <div ref={gridRef} className="w-full">
              <div 
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
                  gap: gridImageSize === 'compact' ? '0.25rem' : gridImageSize === 'comfortable' ? '0.5rem' : '1rem'
                }}
              >
                  {filteredAndSortedPhotoPosts.map((post, index) => {
                    const isSelected = gridSelection.has(post.id);
                    const isFocused = index === focusedIndex;
                    const isRangeStart = rangeMode && rangeStart === index;
                    
                    return (
                      <motion.div
                        key={post.id}
                        data-grid-index={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: Math.min(index * 0.01, 0.5) }}
                        className={`group relative aspect-square cursor-pointer overflow-hidden bg-gray-100 dark:bg-gray-800 ${
                          isFocused ? 'ring-2 ring-primary-500 ring-offset-2' : ''
                        } ${isRangeStart ? 'ring-4 ring-yellow-400 ring-offset-2' : ''}`}
                        onClick={(e) => handleGridImageClick(post, index, e)}
                      >
                        <img
                          src={post.images![0]}
                          alt="Post content"
                          className={`h-full w-full object-cover transition-transform ${
                            isSelected ? 'scale-95' : 'group-hover:scale-105'
                          }`}
                        />
                        
                        {/* Selection overlay */}
                        {isSelected && (
                          <div className="absolute inset-0 bg-primary-500/30 ring-2 ring-inset ring-primary-500" />
                        )}
                        
                        {/* Hover overlay */}
                        <div className={`absolute inset-0 bg-black/0 transition-colors ${
                          !isSelected && 'group-hover:bg-black/20'
                        }`} />
                        
                        {/* Checkbox - Always visible when selected */}
                        <div className={`absolute left-2 top-2 transition-opacity ${
                          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}>
                          <div 
                            className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded border-2 transition-all hover:scale-110 ${
                              isSelected 
                                ? 'border-primary-500 bg-primary-500 shadow-lg' 
                                : 'border-white bg-white/20 backdrop-blur-sm hover:bg-white/40'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              
                              // Handle Shift+Click for range selection
                              if (e.shiftKey && lastSelectedIndex !== null) {
                                const start = Math.min(lastSelectedIndex, index);
                                const end = Math.max(lastSelectedIndex, index);
                                const newSelection = new Set(gridSelection);
                                for (let i = start; i <= end; i++) {
                                  newSelection.add(filteredAndSortedPhotoPosts[i].id);
                                }
                                console.log(`Range select: ${start} to ${end} (${end - start + 1} images) | Total: ${newSelection.size}`);
                                setGridSelection(newSelection);
                                setLastSelectedIndex(index);
                              } else {
                                // Normal toggle
                                const newSelection = new Set(gridSelection);
                                const action = newSelection.has(post.id) ? 'deselect' : 'select';
                                if (newSelection.has(post.id)) {
                                  newSelection.delete(post.id);
                                } else {
                                  newSelection.add(post.id);
                                }
                                console.log(`Checkbox ${action}:`, post.id, '| New selection size:', newSelection.size);
                                setGridSelection(newSelection);
                                setLastSelectedIndex(index);
                              }
                            }}
                          >
                            {isSelected && (
                              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                        
                        {/* Range start indicator */}
                        {isRangeStart && (
                          <div className="absolute right-2 top-2 rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-bold text-yellow-900 shadow-lg">
                            START
                          </div>
                        )}
                        
                        {/* Info on hover */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <p className="text-xs text-white">{post.notes.toLocaleString()} notes</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Empty state */}
                {filteredAndSortedPhotoPosts.length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-12 dark:border-gray-700">
                    <svg className="mb-3 h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-500 dark:text-gray-400">No images match your filters</p>
                    <button
                      onClick={handleClearAllFilters}
                      className="mt-2 text-sm text-primary-600 hover:underline dark:text-primary-400"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            </div>
        ) : (
          /* All Posts Mode - Card View */
          <div className="space-y-3 sm:space-y-4">
            {displayedPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <div className="p-3 sm:p-6">
                  <div className="mb-2 flex items-center space-x-2 sm:mb-4 sm:space-x-3">
                    <img
                      src={blogData.avatar}
                      alt={blogData.username}
                      className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 sm:h-10 sm:w-10"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
                        {blogData.username}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                        {new Date(post.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {post.images && post.images.length > 0 && (
                    <img
                      src={post.images[0]}
                      alt="Post content"
                      className="mb-2 w-full cursor-pointer rounded-lg transition-transform active:scale-[0.98] sm:mb-4 sm:hover:scale-[1.02]"
                      onClick={() => setSelectedImage(post)}
                    />
                  )}

                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 sm:text-base sm:line-clamp-none">{post.content}</p>

                  {post.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
                      {post.tags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => navigate({ 
                            to: '/tag/$tag', 
                            params: { tag }, 
                            search: { scope: 'user', blog: username } 
                          })}
                          className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700 transition-colors hover:bg-primary-500 hover:text-white dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-primary-600 sm:px-3 sm:py-1 sm:text-sm"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400 sm:mt-4 sm:space-x-6 sm:text-sm">
                    <button 
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center space-x-0.5 transition-colors sm:space-x-1 ${
                        likedPosts.has(post.id) 
                          ? 'text-red-500 hover:text-red-600' 
                          : 'hover:text-primary-500'
                      }`}
                    >
                      <svg 
                        className="h-4 w-4 sm:h-5 sm:w-5" 
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
                      <span className="hidden sm:inline">Like</span>
                    </button>
                    <button 
                      onClick={() => {
                        setNotesFilter('comments');
                        setSelectedPostForNotes(post);
                      }}
                      className="flex items-center space-x-0.5 transition-colors hover:text-primary-500 sm:space-x-1"
                    >
                      <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <span className="hidden sm:inline">Comment</span>
                    </button>
                    <button 
                      onClick={() => {
                        setNotesFilter('reblogs');
                        setSelectedPostForNotes(post);
                      }}
                      className="flex items-center space-x-0.5 transition-colors hover:text-primary-500 sm:space-x-1"
                    >
                      <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      <span className="hidden sm:inline">Reblog</span>
                    </button>
                    <div className="ml-auto flex flex-col items-end gap-0.5 sm:flex-row sm:items-center sm:gap-3">
                      <button 
                        onClick={() => {
                          setNotesFilter('all');
                          setSelectedPostForNotes(post);
                        }}
                        className="font-medium transition-colors hover:text-primary-500 hover:underline"
                      >
                        {post.notes.toLocaleString()} <span className="hidden sm:inline">notes</span>
                      </button>
                      <div className="flex gap-2 sm:gap-3">
                        <button 
                          onClick={() => {
                            setNotesFilter('likes');
                            setSelectedPostForNotes(post);
                          }}
                          className="transition-colors hover:text-red-500 hover:underline"
                        >
                          {Math.floor(post.notes * 0.6).toLocaleString()} <span className="hidden xs:inline">likes</span>
                        </button>
                        <button 
                          onClick={() => {
                            setNotesFilter('reblogs');
                            setSelectedPostForNotes(post);
                          }}
                          className="transition-colors hover:text-green-500 hover:underline"
                        >
                          {Math.floor(post.notes * 0.2).toLocaleString()} <span className="hidden xs:inline">reblogs</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
            ))}
          </div>
        )}

        {/* Image Viewer */}
        {selectedImage && selectedImage.images && (
          <ImageViewer
            imageUrl={selectedImage.images[0]}
            isOpen={!!selectedImage}
            onClose={() => setSelectedImage(null)}
            onNext={currentImageIndex < allPhotoPosts.length - 1 ? handleNextImage : undefined}
            onPrevious={currentImageIndex > 0 ? handlePreviousImage : undefined}
            onJumpToEnd={handleJumpToEnd}
            onJumpToStart={handleJumpToStart}
            currentIndex={currentImageIndex}
            totalImages={allPhotoPosts.length}
            blogId={username}
            totalNotes={selectedImage.notes}
            notesList={mockNotesForImage}
            isSelected={selectedImages.has(selectedImage.id)}
            onToggleSelect={() => toggleSelectImage(selectedImage.id)}
          />
        )}

        {/* Notes Panel for regular posts */}
        <NotesPanel
          isOpen={!!selectedPostForNotes}
          onClose={() => setSelectedPostForNotes(null)}
          notes={mockNotesForPost}
          totalNotes={selectedPostForNotes?.notes || 0}
          initialFilter={notesFilter}
        />
        
        <VersionBadge />
      </div>
    </div>
  );
}



