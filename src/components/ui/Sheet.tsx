import { forwardRef, type HTMLAttributes } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

interface SheetProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  position?: 'bottom' | 'right';
}

const Sheet = forwardRef<HTMLDivElement, SheetProps>(
  ({ className, children, isOpen, onClose, position = 'bottom', ...props }, ref) => {
    const variants = {
      bottom: {
        hidden: { y: '100%', opacity: 0 },
        visible: { y: 0, opacity: 1 },
      },
      right: {
        hidden: { x: '100%', opacity: 0 },
        visible: { x: 0, opacity: 1 },
      },
    };

    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black"
              onClick={onClose}
            />

            {/* Sheet */}
            <motion.div
              ref={ref}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={variants[position]}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={cn(
                'fixed z-50 bg-white dark:bg-gray-900',
                position === 'bottom'
                  ? 'inset-x-0 bottom-0 rounded-t-2xl'
                  : 'bottom-0 right-0 top-0 w-full max-w-sm rounded-l-2xl sm:max-w-md',
                className
              )}
              {...props}
            >
              {/* Handle */}
              {position === 'bottom' && (
                <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-700" />
              )}
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }
);
Sheet.displayName = 'Sheet';

const SheetHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
SheetHeader.displayName = 'SheetHeader';

const SheetTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn('text-lg font-semibold', className)}
    {...props}
  />
));
SheetTitle.displayName = 'SheetTitle';

const SheetDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-gray-500 dark:text-gray-400', className)}
    {...props}
  />
));
SheetDescription.displayName = 'SheetDescription';

const SheetContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex-1 overflow-y-auto p-6 pt-0', className)}
    {...props}
  />
));
SheetContent.displayName = 'SheetContent';

const SheetFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center justify-end space-x-2 p-6 pt-0', className)}
    {...props}
  />
));
SheetFooter.displayName = 'SheetFooter';

export {
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetContent,
  SheetFooter,
};



