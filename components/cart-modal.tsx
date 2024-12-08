'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { CartItem } from './ui/product-grid';
import { Button } from './ui/button';
import { ShoppingBasket, Minus, Plus } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
}

export function CartModal({
  isOpen,
  onClose,
  items,
  addToCart,
  removeFromCart
}: CartModalProps) {
  const router = useRouter();
  const total = items.reduce((sum, item) => {
    const price = parseInt(item.price.replace('Rs. ', ''));
    return sum + price * item.quantity;
  }, 0);

  const handleRemoveFromCart = (productId: string) => {
    removeFromCart(productId);
    if (items.length === 1) {
      const remainingItem = items.find((i) => i.item_id === productId);
      if (remainingItem?.quantity === 1) {
        onClose();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle>Your Cart</DialogTitle>
        <div className="mt-4 max-h-[60vh] overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <ShoppingBasket className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                Your cart is empty
              </p>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Feeling hungry? Add some delicious items to your cart!
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
                      onClick={() => handleRemoveFromCart(item.item_id)}
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
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Total</p>
            <p className="font-semibold">Rs. {total}</p>
          </div>
          <Button
            className="w-full"
            disabled={items.length === 0}
            onClick={() => {
              onClose();
              router.push('/checkout');
            }}
          >
            Checkout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
