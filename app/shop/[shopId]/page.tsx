'use client';

import { ShopHeader } from '@/components/ui/shop-header';
import { MenuCategories } from '@/components/ui/menu-categories';
import { ProductGrid } from '@/components/ui/product-grid';
import { Cart } from '@/components/ui/cartNew';
import { useState, useEffect } from 'react';
import { CartItem } from '@/components/ui/product-grid';
import axios from 'axios';
import { NavigationMenuDemo } from '@/components/navbar';
import { useRouter } from 'next/navigation';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Loader } from '@/components/ui/loader';
import { useToast } from '@/hooks/use-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ShopPageProps {
  params: {
    shopId: string;
  };
}

export default function ShopPage({ params }: ShopPageProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [shopData, setShopData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/shop/${params.shopId}`
        );
        setShopData(response.data);
      } catch (error) {
        console.error('Error fetching shop data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, [params.shopId]);

  useEffect(() => {
    async function authenticationCheck() {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          const payload = token.split('.')[1];
          const parsedToken = JSON.parse(atob(payload));

          if (parsedToken.role === 'shop_owner') {
            router.push('/shopdashboard');
          } else if (
            parsedToken.role === 'student' ||
            parsedToken.role === 'teacher'
          ) {
            setIsLoggedIn(true);
          }
        } catch (error) {
          console.error('Error decoding the token:', error);
        }
      } else {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
      }
    }

    authenticationCheck();
  }, [router]);

  const addToCart = (product: CartItem) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.item_id === product.item_id
      );
      let newItems;

      if (existingItem) {
        newItems = prevItems.map((item) =>
          item.item_id === product.item_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...prevItems, { ...product, quantity: 1 }];
      }

      // Update localStorage
      localStorage.setItem('cartItems', JSON.stringify(newItems));

      // Update cart count in navbar
      window.dispatchEvent(
        new CustomEvent('cartUpdated', {
          detail: newItems.length
        })
      );

      return newItems;
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.item_id === productId);
      let newItems;

      if (existingItem && existingItem.quantity > 1) {
        newItems = prevItems.map((item) =>
          item.item_id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        newItems = prevItems.filter((item) => item.item_id !== productId);
      }

      // Update localStorage
      localStorage.setItem('cartItems', JSON.stringify(newItems));

      // Update cart count in navbar
      window.dispatchEvent(
        new CustomEvent('cartUpdated', {
          detail: newItems.length
        })
      );

      return newItems;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/');
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader size="lg" />
          <p className="text-sm text-muted-foreground">Loading shop...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <NavigationMenuDemo
        isLoggedIn={isLoggedIn}
        loading={loading}
        onLogout={handleLogout}
        hideCart={true}
      />
      <div className="flex-1 bg-background pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Breadcrumbs
            items={[
              { label: 'Shops', href: '/', id: 'shops' },
              { label: shopData?.name || 'Shop', href: '#', id: 'current-shop' }
            ]}
          />

          <ShopHeader shopData={shopData} />
          <MenuCategories
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            shopId={params.shopId}
          />

          {/* Mobile Cart */}
          <div className="sticky -mx-4 px-4 py-2 lg:hidden">
            <Cart
              items={cartItems}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              isMobile={true}
              onCheckout={handleCheckout}
              isAuthenticated={isLoggedIn}
            />
          </div>

          {/* Products and Desktop Cart grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ProductGrid
                cartItems={cartItems}
                setCartItems={setCartItems}
                selectedCategory={selectedCategory}
                shopId={params.shopId}
                removeFromCart={removeFromCart}
                isShopOpen={shopData?.is_open ?? false}
              />
            </div>
            {/* Desktop Cart */}
            <div className="hidden lg:col-span-1 lg:block">
              <div className="sticky top-4">
                <Cart
                  items={cartItems}
                  addToCart={addToCart}
                  removeFromCart={removeFromCart}
                  isMobile={false}
                  onCheckout={handleCheckout}
                  isAuthenticated={isLoggedIn}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
