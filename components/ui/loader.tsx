import { cn } from '@/lib/utils';

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

export function Loader({ size = 'sm', className, ...props }: LoaderProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 border-4',
    md: 'h-12 w-12 border-3',
    lg: 'h-8 w-8 border-4'
  };

  return (
    <div className="flex items-center justify-center" {...props}>
      <div
        className={cn(
          'animate-spin rounded-full border-primary/30 border-t-primary',
          sizeClasses[size],
          className
        )}
      />
    </div>
  );
}

export function LoaderSm() {
  return (
    <div className="flex h-[200px] items-center justify-center">
      <div className="flex flex-col items-center space-y-3">
        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        <p className="animate-pulse text-xs text-muted-foreground">
          Loading...
        </p>
      </div>
    </div>
  );
}
