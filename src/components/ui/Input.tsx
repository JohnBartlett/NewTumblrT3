import { forwardRef, type InputHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const inputVariants = cva(
  'flex w-full rounded-lg border bg-white px-3 py-2 text-sm ring-offset-white transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-900 dark:ring-offset-gray-900 dark:placeholder:text-gray-400',
  {
    variants: {
      variant: {
        default: 'border-gray-200 dark:border-gray-800',
        error: 'border-red-500 dark:border-red-500',
      },
      size: {
        sm: 'h-8 text-xs',
        md: 'h-10 text-sm',
        lg: 'h-12 text-base px-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, error, type = 'text', ...props }, ref) => {
    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            inputVariants({
              variant: error ? 'error' : variant,
              size,
              className,
            })
          )}
          ref={ref}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };



