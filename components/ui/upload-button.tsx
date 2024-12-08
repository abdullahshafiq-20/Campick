'use client';

import { UploadCloud, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadButtonProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  preview?: string;
  onImageSelect?: (file: File) => void;
  className?: string;
  isLoading?: boolean;
}

export function UploadButton({
  preview,
  onImageSelect,
  className,
  isLoading,
  ...props
}: UploadButtonProps) {
  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImageSelect) {
      await onImageSelect(file);
    }
  };

  return (
    <label
      className={cn(
        'relative flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-lg',
        'border-2 border-dashed border-primary/50 bg-background/50',
        'transition-colors duration-200 hover:border-primary/80 hover:bg-primary/5',
        'sm:min-h-[120px]',
        isLoading && 'pointer-events-none opacity-70',
        className
      )}
    >
      <div className="flex w-full flex-col items-center justify-center gap-2 p-2 text-center">
        {isLoading ? (
          <Loader2 className="h-10 w-10 animate-spin text-primary/80" />
        ) : preview ? (
          <div className="relative mx-auto aspect-video w-full max-w-[200px]">
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full rounded-lg object-contain"
            />
          </div>
        ) : (
          <>
            <UploadCloud className="h-10 w-10 text-primary/80" />
            <div className="text-base">
              <span className="font-semibold text-primary">
                Click to upload
              </span>{' '}
              <span className="text-muted-foreground">or drag and drop</span>
            </div>
            <p className="text-sm text-muted-foreground">
              SVG, PNG, JPG or GIF (max. 800x400px)
            </p>
          </>
        )}
      </div>
      <input
        type="file"
        className="hidden"
        onChange={handleChange}
        accept="image/*"
        disabled={isLoading}
        {...props}
      />
    </label>
  );
}
