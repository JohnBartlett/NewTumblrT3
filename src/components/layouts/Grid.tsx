import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import { useLayout } from './LayoutContext';

interface GridProps extends HTMLAttributes<HTMLDivElement> {
  gap?: 'none' | 'sm' | 'md' | 'lg';
}

const gapClasses = {
  none: 'gap-0',
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
};

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ className, gap = 'md', ...props }, ref) => {
    const { columns } = useLayout();

    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          gapClasses[gap],
          {
            'grid-cols-1': columns === 1,
            'grid-cols-2': columns === 2,
            'grid-cols-3': columns === 3,
          },
          className
        )}
        {...props}
      />
    );
  }
);
Grid.displayName = 'Grid';

interface GridItemProps extends HTMLAttributes<HTMLDivElement> {
  colSpan?: 1 | 2 | 3;
}

export const GridItem = forwardRef<HTMLDivElement, GridItemProps>(
  ({ className, colSpan = 1, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          {
            'col-span-1': colSpan === 1,
            'col-span-2': colSpan === 2,
            'col-span-3': colSpan === 3,
          },
          className
        )}
        {...props}
      />
    );
  }
);
GridItem.displayName = 'GridItem';



