import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from '@tanstack/react-router';
import { Button } from './Button';
import { SegmentedControl } from './SegmentedControl';

export interface Note {
  id: string;
  type: 'comment' | 'like' | 'reblog';
  user: {
    username: string;
    avatar: string;
  };
  timestamp: number;
  comment?: string;
  reblogComment?: string;
}

interface NotesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  totalNotes: number;
  initialFilter?: 'all' | 'comments' | 'likes' | 'reblogs';
}

export function NotesPanel({ isOpen, onClose, notes, totalNotes, initialFilter = 'all' }: NotesPanelProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'comments' | 'likes' | 'reblogs'>(initialFilter);
  const navigate = useNavigate();
  
  // Update active tab when initialFilter changes and panel opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialFilter);
    }
  }, [isOpen, initialFilter]);

  // Filter notes based on active tab
  const filteredNotes = notes.filter(note => {
    if (activeTab === 'all') return true;
    if (activeTab === 'comments') return note.type === 'comment';
    if (activeTab === 'likes') return note.type === 'like';
    if (activeTab === 'reblogs') return note.type === 'reblog';
    return true;
  });

  // Count by type
  const counts = {
    comments: notes.filter(n => n.type === 'comment').length,
    likes: notes.filter(n => n.type === 'like').length,
    reblogs: notes.filter(n => n.type === 'reblog').length,
  };
  
  const allCount = notes.length;

  const tabOptions = [
    { 
      id: 'all', 
      label: (
        <div className="flex items-center gap-1.5">
          <span>All</span>
          <span className="rounded-full bg-gray-200 px-1.5 py-0.5 text-xs font-medium dark:bg-gray-700">{allCount}</span>
        </div>
      )
    },
    { 
      id: 'comments', 
      label: (
        <div className="flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{counts.comments}</span>
        </div>
      )
    },
    { 
      id: 'likes', 
      label: (
        <div className="flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
          <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">{counts.likes}</span>
        </div>
      )
    },
    { 
      id: 'reblogs', 
      label: (
        <div className="flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">{counts.reblogs}</span>
        </div>
      )
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col bg-white dark:bg-gray-900 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
              <h2 className="text-xl font-bold">Notes</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
              >
                <svg
                  className="h-5 w-5"
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

            {/* Tabs */}
            <div className="border-b border-gray-200 p-4 dark:border-gray-800">
              <SegmentedControl
                options={tabOptions}
                value={activeTab}
                onChange={value => setActiveTab(value as typeof activeTab)}
                size="sm"
              />
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {filteredNotes.length === 0 ? (
                  <div className="flex h-full items-center justify-center p-8 text-center text-gray-500 dark:text-gray-400">
                    <p>No {activeTab === 'all' ? 'notes' : activeTab} yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-800">
                    {filteredNotes.map((note, index) => (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.03 }}
                        className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <div className="flex items-start space-x-2">
                          {/* Avatar */}
                          <img
                            src={note.user.avatar}
                            alt={note.user.username}
                            className="h-8 w-8 rounded-full flex-shrink-0"
                          />

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-1.5">
                              <a
                                href={`/blog/${note.user.username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-semibold text-gray-900 dark:text-white hover:text-primary-500 dark:hover:text-primary-400 transition-colors cursor-pointer"
                              >
                                {note.user.username}
                              </a>
                              {note.type === 'like' && (
                                <svg
                                  className="h-3.5 w-3.5 text-red-500"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                              {note.type === 'reblog' && (
                                <svg
                                  className="h-3.5 w-3.5 text-green-500"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                  />
                                </svg>
                              )}
                              {note.type === 'comment' && (
                                <svg
                                  className="h-3.5 w-3.5 text-blue-500"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                  />
                                </svg>
                              )}
                            </div>

                            <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
                              {new Date(note.timestamp).toLocaleDateString()}
                            </p>

                            {/* Comment/Reblog text */}
                            {note.comment && (
                              <p className="mt-0.5 text-sm text-gray-700 dark:text-gray-300 leading-snug">
                                {note.comment}
                              </p>
                            )}
                            {note.reblogComment && (
                              <p className="mt-0.5 text-sm italic text-gray-600 dark:text-gray-400 leading-snug">
                                "{note.reblogComment}"
                              </p>
                            )}

                            {/* Action text */}
                            {note.type === 'like' && !note.comment && (
                              <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                                liked this
                              </p>
                            )}
                            {note.type === 'reblog' && !note.reblogComment && (
                              <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                                reblogged this
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
