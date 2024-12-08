'use client';

import * as React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('w-full', className)} {...props} />
));
CarouselContent.displayName = 'CarouselContent';

export const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('min-w-0 shrink-0 grow-0 basis-full', className)}
    {...props}
  />
));
CarouselItem.displayName = 'CarouselItem';

export function CarouselPrevious() {
  return (
    <Button
      variant="outline"
      size="icon"
      className="absolute left-2 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full"
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  );
}

export function CarouselNext() {
  return (
    <Button
      variant="outline"
      size="icon"
      className="absolute right-2 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full"
    >
      <ArrowRight className="h-4 w-4" />
    </Button>
  );
}

export function Carousel({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const [emblaRef] = useEmblaCarousel();

  return (
    <div
      ref={emblaRef}
      className={cn('relative overflow-hidden', className)}
      {...props}
    >
      {children}
    </div>
  );
}
