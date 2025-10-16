import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 minutes (increased from 5)
      gcTime: 1000 * 60 * 60 * 24, // 24 hours (increased from 1 hour)
      retry: 3,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      // Cache successful queries aggressively
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

// Create a persister for localStorage
const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'TUMBLR_QUERY_CACHE',
});

// Persist query client to localStorage
persistQueryClient({
  queryClient,
  persister: localStoragePersister,
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  dehydrateOptions: {
    shouldDehydrateQuery: (query) => {
      // Only persist successful queries
      return query.state.status === 'success';
    },
  },
});


