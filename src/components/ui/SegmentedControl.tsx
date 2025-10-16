import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

export interface SegmentedControlOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SegmentedControl({
  options,
  value,
  onChange,
  className,
  size = 'md',
}: SegmentedControlProps) {
  const [activeSegmentRef, setActiveSegmentRef] = useState<HTMLButtonElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Find the active segment element when value changes
    if (containerRef.current) {
      const activeSegment = containerRef.current.querySelector(
        `[data-segment-id="${value}"]`
      ) as HTMLButtonElement;
      setActiveSegmentRef(activeSegment);
    }
  }, [value]);

  const sizeClasses = {
    sm: 'h-7 text-xs',
    md: 'h-9 text-sm',
    lg: 'h-11 text-base',
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800',
        sizeClasses[size],
        className
      )}
    >
      {/* Animated background */}
      {activeSegmentRef && (
        <motion.div
          className="absolute rounded-md bg-white shadow-sm dark:bg-gray-900"
          initial={false}
          animate={{
            width: activeSegmentRef.offsetWidth,
            height: activeSegmentRef.offsetHeight,
            x: activeSegmentRef.offsetLeft,
            y: activeSegmentRef.offsetTop,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 35,
          }}
        />
      )}

      {/* Segments */}
      {options.map(option => (
        <button
          key={option.id}
          data-segment-id={option.id}
          onClick={() => onChange(option.id)}
          className={cn(
            'relative flex flex-1 items-center justify-center rounded-md font-medium transition-colors',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
            value === option.id
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          )}
        >
          {option.icon && <span className="mr-2">{option.icon}</span>}
          {option.label}
        </button>
      ))}
    </div>
  );
}



