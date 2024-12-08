'use client';

import React, { forwardRef, useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import Image from 'next/image';
import demoImg from '@/public/demoimg.png';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Shop {
  id: string;
  name: string;
  description: string;
  image_url: string;
  contact_number: string;
}

interface MenuItem {
  item_id: string;
  name: string;
  description: string;
  price: number;
  shop_id: string;
  image_url: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface MenuDisplayProps {
  shop?: Shop;
}

export const MenuDisplay = forwardRef<HTMLDivElement, MenuDisplayProps>(
  ({ shop }, ref) => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    // Load shop details from localStorage or props
    useEffect(() => {
      if (!shop) {
        const storedShop = localStorage.getItem('selectedShop');
        if (storedShop) {
          setSelectedShop(JSON.parse(storedShop));
        }
      } else {
        localStorage.setItem('selectedShop', JSON.stringify(shop));
        setSelectedShop(shop);
      }
    }, [shop]);

    // Load cart items from localStorage
    useEffect(() => {
      const savedCart = localStorage.getItem('cartItems');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    }, []);

    // Handle cart changes and update the global state
    useEffect(() => {
      const savedCart = localStorage.getItem('cartItems');
      const cartItems = savedCart ? JSON.parse(savedCart) : [];
      window.dispatchEvent(
        new CustomEvent('cartUpdated', { detail: cartItems.length })
      );
    }, [cartItems]);

    // Fetch menu items when the shop is selected
    useEffect(() => {
      if (selectedShop) {
        const fetchMenuItems = async () => {
          try {
            setLoading(true);
            const response = await axios.get(
              `${API_URL}/api/shop/${selectedShop.id}/getAllMenuItems`
            );
            setMenuItems(response.data.items || []);
          } catch (error) {
          } finally {
            setLoading(false);
          }
        };

        fetchMenuItems();
      }
    }, [selectedShop]);

    // Clear cart when shop changes
    useEffect(() => {
      if (selectedShop) {
        setCartItems([]);
        localStorage.removeItem('cartItems');
      }
    }, [selectedShop]);

    // Show login toast if not logged in
    const showLoginToast = () => {
      toast({
        style: { backgroundColor: 'black', color: 'white' },
        title: 'User not logged in',
        description: 'You have to be logged in to perform this action',
        action: (
          <ToastAction
            altText="Go to login page"
            onClick={() => router.push('/signin')}
          >
            Sign in
          </ToastAction>
        )
      });
    };

    const addToCart = (item: MenuItem) => {
      if (!localStorage.getItem('token')) {
        showLoginToast();
        return;
      }

      // Ensure cart items are from the same shop
      const isSameShop = cartItems.every(
        (cartItem) => cartItem.shop_id === item.shop_id
      );
      if (!isSameShop) {
        toast({
          description: 'You can only add items from the same shop.',
          style: { backgroundColor: 'red', color: 'white' }
        });
        return;
      }

      // Update or add item to cart
      const updatedCart = cartItems.some((i) => i.item_id === item.item_id)
        ? cartItems.map((i) =>
            i.item_id === item.item_id ? { ...i, quantity: i.quantity + 1 } : i
          )
        : [...cartItems, { ...item, quantity: 1 }];

      setCartItems(updatedCart);
      localStorage.setItem('cartItems', JSON.stringify(updatedCart));

      updateCartCount(updatedCart); // Dispatch the updated cart item count

      toast({
        description: ` ${item.name}  added to cart`,
        style: {
          backgroundColor: 'rgba(34, 139, 34, 0.8)', // Darker green with opacity
          color: 'white'
        }
      });
    };

    const removeFromCart = (item_id: string) => {
      if (!localStorage.getItem('token')) {
        showLoginToast();
        return;
      }

      const updatedCart = cartItems
        .map((item) =>
          item.item_id === item_id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0);

      setCartItems(updatedCart);
      localStorage.setItem('cartItems', JSON.stringify(updatedCart));

      updateCartCount(updatedCart); // Dispatch the updated cart item count
      toast({
        description: 'Item removed from cart',
        style: {
          backgroundColor: 'rgba(220, 20, 60, 0.8)', // Darker red with opacity
          color: 'white'
        }
      });
    };

    const updateCartCount = (cartItems: CartItem[]) => {
      window.dispatchEvent(
        new CustomEvent('cartUpdated', { detail: cartItems.length })
      );
    };

    const setImage = (image_url: string) => {
      return image_url || demoImg.src;
    };

    if (!selectedShop) {
      return (
        <h3 className="text-md mt-8 text-center font-semibold text-foreground">
          Please select a shop to view its menu.
        </h3>
      );
    }

    if (loading) {
      return (
        <h3 className="text-md mt-8 text-center font-semibold text-foreground">
          Loading menu items...
        </h3>
      );
    }

    return (
      <div ref={ref} className="w-full py-10">
        <div className="container mx-auto">
          <h2 className="text-3xl font-medium tracking-tighter lg:text-4xl">
            Menu Items
          </h2>
          <br />
          <div className="flex flex-wrap gap-5">
            {menuItems.length === 0 ? (
              <h3 className="text-md mt-8 text-center font-semibold text-foreground">
                No menu items available
              </h3>
            ) : (
              menuItems.map((item) => (
                <div
                  className="relative flex w-full flex-col gap-2 rounded-md bg-muted p-4 shadow-md md:w-80"
                  key={item.item_id}
                >
                  <div className="mb-4 aspect-video w-full overflow-hidden rounded-md">
                    <Image
                      src={setImage(item.image_url)}
                      alt={item.name}
                      width={300}
                      height={200}
                      className="h-full w-full rounded-md object-cover"
                    />
                  </div>

                  <h3 className="text-lg font-semibold tracking-tight md:text-xl">
                    {item.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                  <p className="text-lg font-semibold">Rs. {item.price}</p>
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <button
                      onClick={() => addToCart(item)}
                      className="rounded-md border border-black px-3 py-1 text-black opacity-80 hover:bg-gray-200 hover:opacity-70"
                      aria-label={`Add ${item.name} to cart`}
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.item_id)}
                      className="rounded-md border border-black px-3 py-1 text-black opacity-80 hover:bg-gray-200 hover:opacity-70"
                    >
                      -
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }
);

MenuDisplay.displayName = 'MenuDisplay';
