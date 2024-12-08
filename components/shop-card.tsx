'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Heart, Star } from 'lucide-react';
import { useState } from 'react';

interface Promo {
  text: string;
  type: 'discount' | 'combo' | 'special';
}

interface ShopCardProps {
  shop: {
    id: number;
    name: string;
    location: string;
    image: string;
    rating: number;
    reviews: string;
    priceRange: string;
    category: string;
    deliveryTime: string;
    minOrder: string;
    promos: Promo[];
    isAd: boolean;
  };
}

export function ShopCard({ shop }: ShopCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <Card className="group overflow-hidden">
      <div className="relative">
        <Image
          src={shop.image}
          alt={shop.name}
          width={400}
          height={200}
          className="h-48 w-full object-cover"
        />
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute right-2 top-2 rounded-full bg-white/90 p-2 transition-colors hover:bg-white"
        >
          <Heart
            className={`h-5 w-5 ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
            }`}
          />
        </button>
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {shop.promos.map((promo, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-pink-500 text-white hover:bg-pink-500"
            >
              {promo.text}
            </Badge>
          ))}
        </div>
        {shop.isAd && (
          <Badge
            variant="secondary"
            className="absolute bottom-2 right-2 bg-black/50 text-white"
          >
            Ad
          </Badge>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-semibold">
            {shop.name}
            {shop.location && ` – ${shop.location}`}
          </h3>
        </div>
        <div className="mt-1 flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{shop.rating}</span>
          <span className="text-muted-foreground">({shop.reviews})</span>
          <span className="mx-1 text-muted-foreground">•</span>
          <span className="text-muted-foreground">{shop.priceRange}</span>
          <span className="mx-1 text-muted-foreground">•</span>
          <span className="text-muted-foreground">{shop.category}</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <span>{shop.deliveryTime}</span>
          <span>•</span>
          <span>{shop.minOrder}</span>
        </div>
      </div>
    </Card>
  );
}
