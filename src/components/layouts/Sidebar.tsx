import { forwardRef, type HTMLAttributes } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { useLayout } from './LayoutContext';

interface SidebarProps extends HTMLAttributes<HTMLDivElement> {
  position?: 'left' | 'right';
  width?: 'narrow' | 'normal' | 'wide';
}

const sidebarWidths = {
  narrow: 'w-64',
  normal: 'w-80',
  wide: 'w-96',
};

export const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, position = 'left', width = 'normal', children, ...props }, ref) => {
    const { breakpoint, isSidebarOpen, toggleSidebar } = useLayout();

    const isFixed = breakpoint === 'mobile';

    const variants = {
      left: {
        open: { x: 0, opacity: 1 },
        closed: { x: '-100%', opacity: 0 },
      },
      right: {
        open: { x: 0, opacity: 1 },
        closed: { x: '100%', opacity: 0 },
      },
    };

    return (
      <AnimatePresence>
        {/* Backdrop for mobile */}
        {isFixed && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 bg-black"
            onClick={toggleSidebar}
          />
        )}

        {/* Sidebar */}
        <motion.div
          ref={ref}
          initial={isFixed ? variants[position].closed : false}
          animate={
            isFixed ? (isSidebarOpen ? variants[position].open : variants[position].closed) : false
          }
          exit={isFixed ? variants[position].closed : false}
          className={cn(
            'flex flex-col bg-white dark:bg-gray-900',
            sidebarWidths[width],
            {
              'fixed inset-y-0 z-30': isFixed,
              'relative': !isFixed,
              'left-0 border-r': position === 'left',
              'right-0 border-l': position === 'right',
            },
            'border-gray-200 dark:border-gray-800',
            className
          )}
          {...props}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    );
  }
);
Sidebar.displayName = 'Sidebar';

interface SidebarHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export const SidebarHeader = forwardRef<HTMLDivElement, SidebarHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex h-16 shrink-0 items-center border-b border-gray-200 px-4 dark:border-gray-800',
          className
        )}
        {...props}
      />
    );
  }
);
SidebarHeader.displayName = 'SidebarHeader';

interface SidebarContentProps extends HTMLAttributes<HTMLDivElement> {}

export const SidebarContent = forwardRef<HTMLDivElement, SidebarContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex-1 overflow-y-auto p-4', className)}
        {...props}
      />
    );
  }
);
SidebarContent.displayName = 'SidebarContent';

interface SidebarFooterProps extends HTMLAttributes<HTMLDivElement> {}

export const SidebarFooter = forwardRef<HTMLDivElement, SidebarFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'shrink-0 border-t border-gray-200 p-4 dark:border-gray-800',
          className
        )}
        {...props}
      />
    );
  }
);
SidebarFooter.displayName = 'SidebarFooter';



