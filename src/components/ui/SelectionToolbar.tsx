import { Button } from './Button';

interface SelectionToolbarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onSelectNone: () => void;
  onInvertSelection: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onStore?: () => void;
  onDelete?: () => void;
  isDownloading?: boolean;
  downloadProgress?: { current: number; total: number } | null;
  canShare?: boolean;
  isStoring?: boolean;
  rangeMode?: boolean;
  onToggleRangeMode?: () => void;
  rangeStart?: number | null;
}

export function SelectionToolbar({
  selectedCount,
  totalCount,
  onSelectAll,
  onSelectNone,
  onInvertSelection,
  onDownload,
  onShare,
  onStore,
  onDelete,
  isDownloading,
  downloadProgress,
  canShare,
  isStoring,
  rangeMode,
  onToggleRangeMode,
  rangeStart,
}: SelectionToolbarProps) {
  const hasSelection = selectedCount > 0;
  const allSelected = selectedCount === totalCount && totalCount > 0;

  return (
    <div className="sticky top-16 z-20 rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
      {/* Main toolbar content */}
      <div className="flex flex-col gap-2 p-2 sm:gap-3 sm:p-4">
        {/* Top row: Selection counter + Quick actions */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Selection counter */}
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="flex h-7 items-center rounded-md bg-primary-50 px-2 dark:bg-primary-950 sm:h-8 sm:px-3">
              <span className="text-xs font-semibold text-primary-700 dark:text-primary-300 sm:text-sm">
                {selectedCount}
              </span>
              <span className="mx-1 text-xs text-primary-500 dark:text-primary-400 sm:mx-1.5 sm:text-sm">/</span>
              <span className="text-xs text-primary-600 dark:text-primary-400 sm:text-sm">
                {totalCount}
              </span>
            </div>
            <span className="hidden text-xs text-gray-500 dark:text-gray-400 sm:inline">selected</span>
          </div>

          {/* Divider */}
          <div className="hidden h-8 w-px bg-gray-200 dark:bg-gray-700 sm:block" />

          {/* Quick selection actions */}
          {/* Range Mode Toggle (mobile-friendly) */}
          {onToggleRangeMode && (
            <button
              onClick={onToggleRangeMode}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors active:scale-95 touch-manipulation md:hidden sm:gap-1.5 sm:px-3 sm:text-sm ${
                rangeMode
                  ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-500 dark:bg-primary-900/30 dark:text-primary-400 dark:ring-primary-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              title={rangeMode ? (rangeStart !== null ? 'Tap another image to complete range' : 'Tap first image to start range') : 'Tap to select a range of images'}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {rangeMode ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
                )}
              </svg>
              <span>{rangeMode ? (rangeStart !== null ? 'End' : 'Start') : 'Range'}</span>
            </button>
          )}
          
          {!hasSelection ? (
            <button
              onClick={onSelectAll}
              className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 sm:gap-1.5 sm:px-3 sm:text-sm"
              title="Select all images"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span>Select All</span>
            </button>
          ) : (
            <>
              <button
                onClick={onSelectNone}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 sm:gap-1.5 sm:px-3 sm:text-sm"
                title="Deselect all"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Deselect</span>
              </button>

              <button
                onClick={onInvertSelection}
                className="hidden items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 sm:inline-flex sm:gap-1.5 sm:px-3 sm:text-sm"
                title="Invert selection"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span>Invert</span>
              </button>
            </>
          )}
        </div>

        {/* Action buttons - only show when items are selected */}
        {hasSelection && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {/* Share to Photos button */}
              {onShare && canShare && (
                <button
                  onClick={onShare}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  {isDownloading && downloadProgress ? (
                    <>{downloadProgress.current}/{downloadProgress.total}</>
                  ) : (
                    <>Share to Photos</>
                  )}
                </button>
              )}

              {/* Download button */}
              {onDownload && (
                <button
                  onClick={onDownload}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-600"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {isDownloading && downloadProgress ? (
                    <>{downloadProgress.current}/{downloadProgress.total}</>
                  ) : (
                    <>Download</>
                  )}
                </button>
              )}

              {/* Store button */}
              {onStore && (
                <button
                  onClick={onStore}
                  disabled={isStoring}
                  className="inline-flex items-center gap-1.5 rounded-md bg-purple-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50 dark:bg-purple-700 dark:hover:bg-purple-600"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  {isStoring ? <>Storing...</> : <>Store</>}
                </button>
              )}

              {/* Delete button */}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              )}
          </div>
        )}
      </div>
    </div>
  );
}

