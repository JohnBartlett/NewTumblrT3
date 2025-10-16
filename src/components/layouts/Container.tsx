import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import { useLayout } from './LayoutContext';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const containerSizes = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  full: 'max-w-full',
};

const paddingClasses = {
  none: 'px-0',
  sm: 'px-4',
  md: 'px-6',
  lg: 'px-8',
};

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'lg', padding = 'md', ...props }, ref) => {
    const { breakpoint } = useLayout();

    // Adjust padding based on breakpoint
    const responsivePadding = (() => {
      if (padding === 'none') return paddingClasses.none;
      switch (breakpoint) {
        case 'mobile':
          return paddingClasses.sm;
        case 'tablet':
          return paddingClasses[padding === 'lg' ? 'md' : padding];
        case 'desktop':
          return paddingClasses[padding];
        default:
          return paddingClasses.md;
      }
    })();

    return (
      <div
        ref={ref}
        className={cn(
          'mx-auto w-full',
          containerSizes[size],
          responsivePadding,
          className
        )}
        {...props}
      />
    );
  }
);
Container.displayName = 'Container';

interface SectionProps extends HTMLAttributes<HTMLElement> {
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

const spacingClasses = {
  none: 'py-0',
  sm: 'py-4',
  md: 'py-8',
  lg: 'py-12',
};

export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ className, spacing = 'md', ...props }, ref) => {
    const { breakpoint } = useLayout();

    // Adjust spacing based on breakpoint
    const responsiveSpacing = (() => {
      if (spacing === 'none') return spacingClasses.none;
      switch (breakpoint) {
        case 'mobile':
          return spacingClasses.sm;
        case 'tablet':
          return spacingClasses[spacing === 'lg' ? 'md' : spacing];
        case 'desktop':
          return spacingClasses[spacing];
        default:
          return spacingClasses.md;
      }
    })();

    return (
      <section
        ref={ref}
        className={cn(responsiveSpacing, className)}
        {...props}
      />
    );
  }
);
Section.displayName = 'Section';



