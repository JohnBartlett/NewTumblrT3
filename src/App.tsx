import { RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as JotaiProvider } from 'jotai';

import { router } from '@/routes';
import { LayoutProvider } from '@/components/layouts/LayoutContext';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import './styles/index.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60, // 1 hour
      retry: 3,
      refetchOnWindowFocus: true,
    },
  },
});

function App() {
  return (
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LayoutProvider>
            <RouterProvider router={router} />
          </LayoutProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </JotaiProvider>
  );
}

export default App;