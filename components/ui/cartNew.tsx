'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBasket, Minus, Plus } from 'lucide-react';
import { CartItem } from './product-grid';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

interface CartProps {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  isMobile: boolean;
  onCheckout?: () => void;
  isAuthenticated?: boolean;
}

export function Cart({
  items,
  addToCart,
  removeFromCart,
  isMobile,
  onCheckout,
  isAuthenticated = false
}: CartProps) {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleCheckout = () => {
    console.log('Authentication status:', isAuthenticated);
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to proceed with checkout',
        variant: 'destructive'
      });
      return;
    }
    onCheckout?.();
  };

  const total = items.reduce((sum, item) => {
    const price = parseInt(item.price.replace('Rs. ', ''));
    return sum + price * item.quantity;
  }, 0);

  if (isMobile) {
    return (
      <div className="rounded-lg shadow">
        <button
          className="flex w-full items-center justify-between p-4"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            <ShoppingBasket className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm font-semibold sm:text-base">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold sm:text-base">
              Rs. {total}
            </span>
            <div
              className={`transform transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
            >
              ▼
            </div>
          </div>
        </button>

        {isExpanded && (
          <div className="border-t p-4">
            <div className="max-h-[60vh] overflow-y-auto">
              {items.length === 0 ? (
                <div className="py-8 text-center">
                  <ShoppingBasket className="mx-auto mb-4 h-10 w-10 text-muted-foreground sm:h-12 sm:w-12" />
                  <p className="text-sm text-muted-foreground sm:text-base">
                    Your cart is empty
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.item_id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <Image
                          src={item.image_url || '/placeholder.svg'}
                          alt={item.name}
                          width={40}
                          height={40}
                          className="rounded-lg object-cover"
                        />
                        <div>
                          <h3 className="text-sm font-medium sm:text-base">
                            {item.name}
                          </h3>
                          <p className="text-xs text-muted-foreground sm:text-sm">
                            {item.price} x {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => removeFromCart(item.item_id)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => addToCart(item)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-4 border-t pt-4">
              <Button
                className="w-full"
                disabled={items.length === 0}
                onClick={handleCheckout}
              >
                Checkout
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop version (existing cart layout)
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold">Your Cart</h2>
      <div className="min-h-[400px]">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            <ShoppingBasket className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Your cart is empty</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.item_id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <Image
                    src={item.image_url || '/placeholder.svg'}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.price} x {item.quantity}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={() => removeFromCart(item.item_id)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={() => addToCart(item)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-6 border-t pt-4">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-semibold">Total</p>
          <p className="font-semibold">Rs. {total}</p>
        </div>
        <Button
          className="w-full"
          disabled={items.length === 0}
          onClick={handleCheckout}
        >
          Checkout
        </Button>
      </div>
    </div>
  );
}
