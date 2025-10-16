import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { NotesPanel, type Note } from './NotesPanel';

interface ImageViewerProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onJumpToEnd?: () => void;
  onJumpToStart?: () => void;
  currentIndex?: number;
  totalImages?: number;
  postId?: string;
  blogId?: string;
  totalNotes?: number;
  notesList?: Note[];
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export function ImageViewer({
  isOpen,
  imageUrl,
  onClose,
  onNext,
  onPrevious,
  onJumpToEnd,
  onJumpToStart,
  currentIndex = 0,
  totalImages = 0,
  postId,
  blogId,
  totalNotes,
  notesList = [],
  isSelected = false,
  onToggleSelect,
}: ImageViewerProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  // Close on Escape key, navigate with arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isZoomed) {
          // First ESC unzooms, second ESC closes
          setIsZoomed(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowRight' && onNext) {
        onNext();
        // Keep zoomed state when navigating
      } else if (e.key === 'ArrowLeft' && onPrevious) {
        onPrevious();
        // Keep zoomed state when navigating
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isZoomed, onClose, onNext, onPrevious]);

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZoomed(!isZoomed);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/95 backdrop-blur-sm"
          />

          {/* Image Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative z-10 flex flex-col ${isZoomed ? 'h-screen w-screen' : 'max-h-[95vh] max-w-[95vw]'}`}
          >
            {/* Top Controls */}
            {!isZoomed && (
              <div className="mb-4 flex items-center justify-between gap-4">
                {/* Image counter */}
                {totalImages > 0 && (
                  <div className="rounded-lg bg-white/10 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
                    {currentIndex + 1} / {totalImages}
                  </div>
                )}

                {/* Navigation hint */}
                {(onPrevious || onNext) && (
                  <div className="flex items-center space-x-2 text-sm text-white/60">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Arrow keys</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
                
                <div className="ml-auto flex items-center gap-2">
                  {/* Select button */}
                  {onToggleSelect && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onToggleSelect}
                      className={`text-white ${isSelected ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-white/10'}`}
                    >
                      <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {isSelected ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        )}
                      </svg>
                      {isSelected ? 'Selected' : 'Select'}
                    </Button>
                  )}

                  {/* Jump to start button */}
                  {onJumpToStart && totalImages > 1 && currentIndex > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onJumpToStart}
                      className="text-white hover:bg-white/10"
                      title="Jump to first image"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    </Button>
                  )}

                  {/* Jump to end button */}
                  {onJumpToEnd && totalImages > 1 && currentIndex < totalImages - 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onJumpToEnd}
                      className="text-white hover:bg-white/10"
                      title="Jump to last image"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </Button>
                  )}

                  {/* Close button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="text-white hover:bg-white/10"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </Button>
                </div>
              </div>
            )}

            {/* Close button for zoomed view */}
            {isZoomed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute right-4 top-4 z-30 text-white hover:bg-white/10"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            )}

            {/* Image with zoom */}
            <div className={`relative flex flex-1 items-center justify-center ${isZoomed ? 'overflow-auto' : 'overflow-hidden'}`}>
              {/* Previous button */}
              {onPrevious && !isZoomed && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrevious();
                  }}
                  className="absolute left-4 z-20 text-white hover:bg-white/10"
                >
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Button>
              )}

              <img
                src={imageUrl}
                alt="Full size"
                className={`${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'} ${isZoomed ? 'min-h-screen min-w-full object-contain' : 'max-h-[80vh] max-w-[90vw] rounded-lg object-contain'}`}
                onClick={handleImageClick}
              />

              {/* Next button */}
              {onNext && !isZoomed && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNext();
                  }}
                  className="absolute right-4 z-20 text-white hover:bg-white/10"
                >
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              )}
            </div>

            {/* Zoom hint */}
            {!isZoomed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-2 text-center text-sm text-white/60"
              >
                Click image to zoom
              </motion.div>
            )}

            {/* Post info - shown when not zoomed */}
            {(blogId || totalNotes !== undefined) && !isZoomed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4 flex items-center justify-between rounded-lg bg-white/10 px-4 py-3 text-white backdrop-blur-sm"
              >
                {blogId && (
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-white/20" />
                    <span className="font-medium">{blogId}</span>
                  </div>
                )}
                {totalNotes !== undefined && (
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/10"
                    >
                      <svg
                        className="mr-1 h-4 w-4"
                        fill="none"
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
                      Like
                    </Button>
                    <button
                      onClick={() => setShowNotes(true)}
                      className="text-sm hover:underline"
                    >
                      {totalNotes} notes
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Post info - shown at bottom when zoomed */}
            {(blogId || totalNotes !== undefined) && isZoomed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent px-6 py-4 text-white backdrop-blur-sm"
              >
                {/* Blog name on the left */}
                {blogId && (
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-white/20" />
                    <span className="text-lg font-semibold">{blogId}</span>
                  </div>
                )}
                
                {/* Spacer if no blog ID */}
                {!blogId && <div />}

                {/* Likes and notes on the right */}
                {totalNotes !== undefined && (
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg
                        className="mr-2 h-5 w-5"
                        fill="none"
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
                      Like
                    </Button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowNotes(true);
                      }}
                      className="text-base font-medium hover:underline"
                    >
                      {totalNotes.toLocaleString()} notes
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      )}

      {/* Notes Panel */}
      <NotesPanel
        isOpen={showNotes}
        onClose={() => setShowNotes(false)}
        notes={notesList}
        totalNotes={totalNotes || 0}
      />
    </AnimatePresence>
  );
}