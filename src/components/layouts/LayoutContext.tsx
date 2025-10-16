import { createContext, useContext, useEffect, useState } from 'react';

type Breakpoint = 'mobile' | 'tablet' | 'desktop';
type ColumnLayout = 1 | 2 | 3;

interface LayoutContextType {
  breakpoint: Breakpoint;
  columns: ColumnLayout;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}

interface LayoutProviderProps {
  children: React.ReactNode;
}

export function LayoutProvider({ children }: LayoutProviderProps) {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setBreakpoint('mobile');
        setIsSidebarOpen(false);
      } else if (width < 1024) {
        setBreakpoint('tablet');
        setIsSidebarOpen(true);
      } else {
        setBreakpoint('desktop');
        setIsSidebarOpen(true);
      }
    };

    // Initial check
    updateBreakpoint();

    // Listen for window resize
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  const columns: ColumnLayout = (() => {
    switch (breakpoint) {
      case 'mobile':
        return 1;
      case 'tablet':
        return 2;
      case 'desktop':
        return 3;
      default:
        return 1;
    }
  })();

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  return (
    <LayoutContext.Provider
      value={{
        breakpoint,
        columns,
        isSidebarOpen,
        toggleSidebar,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}



