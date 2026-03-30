import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-top-full',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        destructive: 'border-destructive bg-destructive text-destructive-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  title?: string;
  description?: string;
  duration?: number;
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, title, description, variant, duration = 5000, ...props }, ref) => {
    const [open, setOpen] = React.useState(true);

    React.useEffect(() => {
      const timer = setTimeout(() => {
        setOpen(false);
      }, duration);
      return () => clearTimeout(timer);
    }, [duration]);

    return (
      <div
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        data-state={open ? 'open' : 'closed'}
        {...props}
      >
        <div className="flex-1">
          {title && <div className="text-sm font-medium">{title}</div>}
          {description && (
            <div className="text-sm opacity-90">{description}</div>
          )}
        </div>
        <button
          onClick={() => setOpen(false)}
          className="ml-auto rounded-full p-1 text-foreground/60 hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }
);
Toast.displayName = 'Toast';

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">{children}</div>;
};