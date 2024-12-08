import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ShopHeaderProps {
  shopData: {
    id: string;
    name: string;
    description: string;
    image_url: string;
    contact_number: string;
    is_open: boolean;
  } | null;
}

export function ShopHeader({ shopData }: ShopHeaderProps) {
  if (!shopData) return null;

  return (
    <div className="mb-8 flex items-start space-x-6">
      <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-sky-400">
        <Image
          src={shopData.image_url || '/placeholder.svg'}
          alt={shopData.name}
          width={128}
          height={128}
          className="h-full w-full rounded-lg object-cover"
        />
      </div>
      <div className="flex-1">
        <div className="mb-2 flex items-center space-x-2">
          <Badge variant="secondary">Restaurant</Badge>
          <Badge
            variant="outline"
            className={cn(
              'font-semibold',
              shopData.is_open
                ? 'border-green-500 bg-green-100 text-green-700'
                : 'border-red-500 bg-red-100 text-red-700'
            )}
          >
            {shopData.is_open ? 'Open' : 'Closed'}
          </Badge>
        </div>
        <h1 className="mb-2 text-3xl font-bold">{shopData.name}</h1>
        <div className="flex items-center space-x-4 text-lg">
          <span className="text-muted-foreground">{shopData.description}</span>
        </div>
        <div className="mt-2 flex items-center space-x-4">
          <div className="flex items-center">
            <span className="ml-1 text-lg font-medium">
              {shopData.contact_number}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
