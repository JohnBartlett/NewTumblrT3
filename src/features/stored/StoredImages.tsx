import { useState, useEffect, useRef, useMemo } from 'react';
import { useAtom } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from '@/components/layouts';
import { Button, ImageViewer, VersionBadge, SelectionToolbar, ImageFilters, type ImageFiltersState } from '@/components/ui';
import { userAtom } from '@/store/auth';
import { shareImages, downloadImages, downloadImagesServerSide, canShareFiles, getImageFilename, type ImageMetadata } from '@/utils/imageDownload';
import { filenamePatternAtom, includeIndexInFilenameAtom, includeSidecarMetadataAtom, downloadMethodAtom, gridColumnsAtom, gridImageSizeAtom, updatePreferencesAtom } from '@/store/preferences';

// Dynamic API URL based on current host
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:3001`;
  }
  return 'http://localhost:3001';
};
const API_URL = getApiUrl();

interface StoredImage {
  id: string;
  postId: string;
  blogName: string;
  url: string;
  width: number | null;
  height: number | null;
  tags: string;
  description: string | null;
  notes: number;
  timestamp: string;
  storedAt: string;
}

interface StoredImagesStats {
  total: number;
  byBlog: Array<{ blogName: string; count: number }>;
}

export function StoredImages() {
  const [user] = useAtom(userAtom);
  const [images, setImages] = useState<StoredImage[]>([]);
  const [stats, setStats] = useState<StoredImagesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [filterBlog, setFilterBlog] = useState<string | null>(null);
  
  // Grid preferences
  const [filenamePattern] = useAtom(filenamePatternAtom);
  const [includeIndex] = useAtom(includeIndexInFilenameAtom);
  const [includeSidecarMetadata] = useAtom(includeSidecarMetadataAtom);
  const [downloadMethod] = useAtom(downloadMethodAtom);
  const [gridColumns] = useAtom(gridColumnsAtom);
  const [gridImageSize] = useAtom(gridImageSizeAtom);
  const [, updatePreferences] = useAtom(updatePreferencesAtom);
  
  // Selection state
  const [gridSelection, setGridSelection] = useState<Set<string>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const gridRef = useRef<HTMLDivElement>(null);
  
  // Filter state
  const [imageFilters, setImageFilters] = useState<ImageFiltersState>({
    sizes: new Set<string>(),
    dates: new Set<string>(),
    sort: 'recent',
  });
  
  // Download/share state
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{ current: number; total: number } | null>(null);
  const [isFilterSticky, setIsFilterSticky] = useState(true);
  
  // Range selection mode for mobile
  const [rangeMode, setRangeMode] = useState(false);
  const [rangeStart, setRangeStart] = useState<number | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchImages();
      fetchStats();
    }
  }, [user?.id, filterBlog]);

  // Filter and sort images - MUST BE BEFORE useEffects that use it
  const filteredAndSortedImages = useMemo(() => {
    let filtered = [...images];

    // Apply size filters
    if (imageFilters.sizes.size > 0) {
      filtered = filtered.filter(img => {
        if (!img.width || !img.height) return false;
        const size = img.width * img.height;
        if (imageFilters.sizes.has('small') && size <= 800 * 600) return true;
        if (imageFilters.sizes.has('medium') && size > 800 * 600 && size <= 1000 * 800) return true;
        if (imageFilters.sizes.has('large') && size > 1000 * 800) return true;
        return false;
      });
    }

    // Apply date filters
    if (imageFilters.dates.size > 0) {
      const now = Date.now();
      filtered = filtered.filter(img => {
        const imgTime = new Date(img.storedAt).getTime();
        const dayAgo = now - 86400000;
        const weekAgo = now - 7 * 86400000;
        const monthAgo = now - 30 * 86400000;

        if (imageFilters.dates.has('today') && imgTime >= dayAgo) return true;
        if (imageFilters.dates.has('this-week') && imgTime >= weekAgo) return true;
        if (imageFilters.dates.has('this-month') && imgTime >= monthAgo) return true;
        return false;
      });
    }

    // Apply sort
    switch (imageFilters.sort) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.storedAt).getTime() - new Date(a.storedAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.storedAt).getTime() - new Date(b.storedAt).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => b.notes - a.notes);
        break;
    }

    return filtered;
  }, [images, imageFilters]);

  // Reset focused index when filters change
  useEffect(() => {
    setFocusedIndex(0);
  }, [imageFilters]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!filteredAndSortedImages.length) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const currentIndex = focusedIndex;
      const cols = gridColumns;
      const maxIndex = filteredAndSortedImages.length - 1;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedIndex(Math.max(0, currentIndex - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setFocusedIndex(Math.min(maxIndex, currentIndex + 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(Math.max(0, currentIndex - cols));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(Math.min(maxIndex, currentIndex + cols));
          break;
        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setFocusedIndex(maxIndex);
          break;
        case 'PageUp':
          e.preventDefault();
          setFocusedIndex(Math.max(0, currentIndex - cols * 3));
          break;
        case 'PageDown':
          e.preventDefault();
          setFocusedIndex(Math.min(maxIndex, currentIndex + cols * 3));
          break;
        case 'Enter':
          e.preventDefault();
          setSelectedImage(currentIndex);
          break;
        case ' ':
          e.preventDefault();
          const image = filteredAndSortedImages[currentIndex];
          if (image) {
            const newSelection = new Set(gridSelection);
            if (newSelection.has(image.id)) {
              newSelection.delete(image.id);
            } else {
              newSelection.add(image.id);
            }
            setGridSelection(newSelection);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, filteredAndSortedImages, gridColumns, gridSelection]);

  // Scroll focused element into view
  useEffect(() => {
    const element = document.querySelector(`[data-grid-index="${focusedIndex}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [focusedIndex]);

  const fetchImages = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: '500',
        offset: '0',
      });
      
      if (filterBlog) {
        params.append('blogName', filterBlog);
      }

      const response = await fetch(
        `${API_URL}/api/stored-images/${user.id}?${params}`
      );

      if (!response.ok) throw new Error('Failed to fetch images');

      const data = await response.json();
      setImages(data.images);
    } catch (error) {
      console.error('Error fetching images:', error);
      alert('Failed to load stored images');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        `${API_URL}/api/stored-images/${user.id}/stats`
      );

      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Selection handlers
  const handleSelectAll = () => {
    setGridSelection(new Set(filteredAndSortedImages.map(img => img.id)));
  };

  const handleSelectNone = () => {
    setGridSelection(new Set());
    setLastSelectedIndex(null);
  };

  const handleInvertSelection = () => {
    const allIds = new Set(filteredAndSortedImages.map(img => img.id));
    const newSelection = new Set<string>();
    allIds.forEach(id => {
      if (!gridSelection.has(id)) {
        newSelection.add(id);
      }
    });
    setGridSelection(newSelection);
  };

  const handleDelete = async () => {
    if (gridSelection.size === 0) return;
    if (!confirm(`Delete ${gridSelection.size} image(s) from storage?`)) return;

    try {
      let successCount = 0;
      for (const imageId of Array.from(gridSelection)) {
        const response = await fetch(
          `${API_URL}/api/stored-images/${imageId}?userId=${user?.id}`,
          { method: 'DELETE' }
        );
        if (response.ok) successCount++;
      }

      alert(`✅ Deleted ${successCount} image(s) from storage`);
      setGridSelection(new Set());
      fetchImages();
      fetchStats();
    } catch (error) {
      console.error('Error deleting images:', error);
      alert('❌ Failed to delete images');
    }
  };

  const handleShare = async () => {
    if (gridSelection.size === 0 || isDownloading) return;

    setIsDownloading(true);
    setDownloadProgress({ current: 0, total: gridSelection.size });

    try {
      const selectedImages = images.filter(img => gridSelection.has(img.id));
      
      const imagesToShare = selectedImages.map((img, index) => {
        const parsedTags = JSON.parse(img.tags || '[]');
        const metadata: ImageMetadata = {
          blogName: img.blogName,
          blogUrl: `https://tumblr.com/${img.blogName}`,
          tags: parsedTags,
          notes: img.notes,
          timestamp: new Date(img.timestamp).getTime(),
          description: img.description || undefined,
          postUrl: `https://tumblr.com/${img.blogName}/post/${img.postId}`,
        };

        return {
          url: img.url,
          filename: getImageFilename(img.url, index, img.blogName),
          metadata,
          options: {
            pattern: filenamePattern,
            includeIndex: includeIndex,
          },
        };
      });

      const result = await shareImages(
        imagesToShare,
        (current, total) => {
          setDownloadProgress({ current, total });
        }
      );

      setDownloadProgress(null);
      setIsDownloading(false);

      if (result.succeeded === 0 && result.failed === 0) return;
      
      if (result.failed === 0) {
        alert(`✅ Successfully shared ${result.succeeded} image(s) to Photos!`);
      } else {
        alert(`Shared ${result.succeeded} image(s). ${result.failed} failed.`);
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
      const selectedImages = images.filter(img => gridSelection.has(img.id));
      
      const imagesToDownload = selectedImages.map((img, index) => {
        const parsedTags = JSON.parse(img.tags || '[]');
        const metadata: ImageMetadata = {
          blogName: img.blogName,
          blogUrl: `https://tumblr.com/${img.blogName}`,
          tags: parsedTags,
          notes: img.notes,
          timestamp: new Date(img.timestamp).getTime(),
          description: img.description || undefined,
          postUrl: `https://tumblr.com/${img.blogName}/post/${img.postId}`,
        };

        return {
          url: img.url,
          filename: getImageFilename(img.url, index, img.blogName),
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
      
      await downloadFn(
        imagesToDownload,
        (current, total) => {
          setDownloadProgress({ current, total });
        },
        includeSidecarMetadata
      );

      setDownloadProgress(null);
      setIsDownloading(false);
      alert(`✅ Downloaded ${imagesToDownload.length} image(s) with metadata!`);
    } catch (error) {
      setDownloadProgress(null);
      setIsDownloading(false);
      alert(`❌ Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Filter handlers
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

  if (!user) {
    return (
      <Container>
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Please login to view stored images</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Stored Images</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {stats ? `${stats.total} total images stored` : 'Loading...'}
            </p>
          </div>
          <Button onClick={() => { setFilterBlog(null); fetchImages(); }} variant="outline">
            Refresh
          </Button>
        </div>

        {/* Stats / Blog Filter */}
        {stats && stats.byBlog.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <h2 className="text-sm font-semibold mb-3">Filter by Blog</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={filterBlog === null ? 'default' : 'outline'}
                onClick={() => setFilterBlog(null)}
              >
                All ({stats.total})
              </Button>
              {stats.byBlog.map((blog) => (
                <Button
                  key={blog.blogName}
                  size="sm"
                  variant={filterBlog === blog.blogName ? 'default' : 'outline'}
                  onClick={() => setFilterBlog(blog.blogName)}
                >
                  {blog.blogName} ({blog.count})
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading images...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {filterBlog ? `No images stored from ${filterBlog}` : 'No images stored yet'}
            </p>
            <p className="text-sm text-gray-500">
              Use the "Store" button in the blog view to save images
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selection Toolbar */}
            <SelectionToolbar
              selectedCount={gridSelection.size}
              totalCount={filteredAndSortedImages.length}
              onSelectAll={handleSelectAll}
              onSelectNone={handleSelectNone}
              onInvertSelection={handleInvertSelection}
              onDownload={handleDownload}
              onShare={handleShare}
              onDelete={handleDelete}
              isDownloading={isDownloading}
              downloadProgress={downloadProgress}
              canShare={canShareFiles()}
              rangeMode={rangeMode}
              onToggleRangeMode={() => {
                setRangeMode(!rangeMode);
                setRangeStart(null);
              }}
              rangeStart={rangeStart}
            />

            {/* Filters */}
            <div
              className={`bg-white dark:bg-gray-800 ${
                isFilterSticky
                  ? 'sticky top-16 z-40'
                  : 'relative'
              } rounded-lg border border-gray-200 p-4 shadow-sm transition-all dark:border-gray-800`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
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
                
                {/* Sticky Toggle Button */}
                <button
                  onClick={() => setIsFilterSticky(!isFilterSticky)}
                  className={`flex-shrink-0 rounded-lg p-2 transition-colors ${
                    isFilterSticky
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                  title={isFilterSticky ? 'Unlock filters (scroll with page)' : 'Lock filters (stay at top)'}
                >
                  {isFilterSticky ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Image Grid */}
            {filteredAndSortedImages.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400 mb-2">No images match your filters</p>
                <Button onClick={handleClearAllFilters} variant="outline" size="sm">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div ref={gridRef} className="w-full">
                <div 
                  className="grid"
                  style={{
                    gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
                    gap: gridImageSize === 'compact' ? '0.25rem' : gridImageSize === 'comfortable' ? '0.5rem' : '1rem'
                  }}
                >
                  {filteredAndSortedImages.map((image, index) => {
                    const isSelected = gridSelection.has(image.id);
                    const isFocused = index === focusedIndex;
                    const isRangeStart = rangeMode && rangeStart === index;
                    
                    return (
                      <motion.div
                        key={image.id}
                        data-grid-index={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.01 }}
                        className={`group relative aspect-square cursor-pointer overflow-hidden rounded ${
                          isFocused ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-900' : ''
                        } ${isRangeStart ? 'ring-4 ring-yellow-400 ring-offset-2' : ''}`}
                        onClick={(e) => {
                          // Range Mode (mobile-friendly)
                          if (rangeMode) {
                            if (rangeStart === null) {
                              // First tap - set range start
                              setRangeStart(index);
                              const newSelection = new Set(gridSelection);
                              newSelection.add(image.id);
                              setGridSelection(newSelection);
                            } else {
                              // Second tap - select range and exit mode
                              const start = Math.min(rangeStart, index);
                              const end = Math.max(rangeStart, index);
                              const newSelection = new Set(gridSelection);
                              for (let i = start; i <= end; i++) {
                                newSelection.add(filteredAndSortedImages[i].id);
                              }
                              setGridSelection(newSelection);
                              setRangeMode(false);
                              setRangeStart(null);
                              setLastSelectedIndex(index);
                            }
                            return;
                          }
                          
                          if (e.shiftKey && lastSelectedIndex !== null) {
                            const start = Math.min(lastSelectedIndex, index);
                            const end = Math.max(lastSelectedIndex, index);
                            const newSelection = new Set(gridSelection);
                            for (let i = start; i <= end; i++) {
                              newSelection.add(filteredAndSortedImages[i].id);
                            }
                            setGridSelection(newSelection);
                            setLastSelectedIndex(index);
                          } else if (e.ctrlKey || e.metaKey) {
                            const newSelection = new Set(gridSelection);
                            if (newSelection.has(image.id)) {
                              newSelection.delete(image.id);
                            } else {
                              newSelection.add(image.id);
                            }
                            setGridSelection(newSelection);
                            setLastSelectedIndex(index);
                          } else {
                            setSelectedImage(index);
                          }
                        }}
                      >
                        <img
                          src={image.url}
                          alt={image.description || 'Stored image'}
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
                                  newSelection.add(filteredAndSortedImages[i].id);
                                }
                                setGridSelection(newSelection);
                                setLastSelectedIndex(index);
                              } else {
                                // Normal toggle
                                const newSelection = new Set(gridSelection);
                                if (newSelection.has(image.id)) {
                                  newSelection.delete(image.id);
                                } else {
                                  newSelection.add(image.id);
                                }
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
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <p className="text-xs font-semibold text-white">{image.blogName}</p>
                          <p className="text-xs text-white/80">{image.notes} notes</p>
                          <p className="text-[10px] text-white/60">{new Date(image.storedAt).toLocaleDateString()}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Image Viewer */}
        <AnimatePresence>
          {selectedImage !== null && (
            <ImageViewer
              images={filteredAndSortedImages.map((img) => img.url)}
              initialIndex={selectedImage}
              onClose={() => setSelectedImage(null)}
              currentIndex={selectedImage}
              totalImages={filteredAndSortedImages.length}
              onJumpToEnd={() => setSelectedImage(filteredAndSortedImages.length - 1)}
              onJumpToStart={() => setSelectedImage(0)}
            />
          )}
        </AnimatePresence>

        <VersionBadge />
      </div>
    </Container>
  );
}
