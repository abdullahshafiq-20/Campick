'use client';

import { Button } from '@/components/ui/button';
import { CartItem } from '@/components/ui/product-grid';
import {
  CircleUser,
  ShoppingCart,
  ClipboardList,
  User,
  Package,
  LogOut
} from 'lucide-react';
import Link from 'next/link';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MouseEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
// import AdminSearch from '@/components/admin-search';
import MainLogo from '@/public/campick-new-logo.svg';
import { CartModal } from '@/components/cart-modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserData {
  email: string;
  id: number | null;
  role: string;
  name: string;
  imageURL: string;
}

const UserMenu = ({
  userData,
  onLogout,
  router
}: {
  userData: any;
  onLogout: () => void;
  router: any;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={userData?.imageURL || ''}
            alt={userData?.name || 'User'}
          />
          <AvatarFallback>
            {userData?.name ? userData.name[0].toUpperCase() : 'U'}
          </AvatarFallback>
        </Avatar>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-56" align="end" forceMount>
      <DropdownMenuItem>
        <Link href="/profile" className="flex items-center">
          <User className="mr-2 h-4 w-4" />
          Profile
        </Link>
      </DropdownMenuItem>
      {/* <DropdownMenuItem>
        <Link href="/orders" className="flex items-center">
          <Package className="mr-2 h-4 w-4" />
          Orders
        </Link>
      </DropdownMenuItem> */}
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={onLogout}>
        <LogOut className="mr-2 h-4 w-4" />
        <span>Log out</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export const NavigationMenuDemo = ({
  isLoggedIn,
  loading,
  onLogout,
  hideCart = false
}: {
  isLoggedIn: boolean;
  loading: boolean;
  onLogout: () => void;
  hideCart?: boolean;
}) => {
  const router = useRouter();
  const [scrolling, setScrolling] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    email: '',
    id: null,
    role: '',
    name: '',
    imageURL: ''
  });

  const [cartItemCount, setCartItemCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');

    if (savedCart) {
      setCartItemCount(JSON.parse(savedCart).length);
    }

    const updateCartItemCount = (event: CustomEvent) => {
      const count = event.detail;
      setCartItemCount(count > 0 ? count : 0);
    };

    window.addEventListener(
      'cartUpdated',
      updateCartItemCount as EventListener
    );

    // Cleanup listener when component unmounts
    return () => {
      window.removeEventListener(
        'cartUpdated',
        updateCartItemCount as EventListener
      );
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolling(window.scrollY > 0);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const user = JSON.parse(atob(token.split('.')[1]));

      setUserData(user);
      console.log(user);
    }
  }, []);

  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const newItems = prev.map((i) =>
        i.item_id === item.item_id ? { ...i, quantity: i.quantity + 1 } : i
      );
      localStorage.setItem('cartItems', JSON.stringify(newItems));
      return newItems;
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prev) => {
      const newItems = prev
        .map((item) => {
          if (item.item_id === itemId) {
            return item.quantity > 1
              ? { ...item, quantity: item.quantity - 1 }
              : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null); // Remove null items

      // Update localStorage
      localStorage.setItem('cartItems', JSON.stringify(newItems));

      // Update cart count
      setCartItemCount(newItems.length);

      // Dispatch event for other components
      window.dispatchEvent(
        new CustomEvent('cartUpdated', {
          detail: newItems.length
        })
      );

      return newItems;
    });
  };

  const userLogout = () => {
    localStorage.clear(); // Clear all local storage keys on logout
    setUserData({
      email: '',
      id: null,
      role: '',
      name: '',
      imageURL: ''
    });
    onLogout(); // Ensure the parent updates `isLoggedIn` to `false`.
  };

  return (
    <>
      <header
        className={`fixed left-0 top-0 z-40 w-full bg-background transition-shadow duration-300 ${
          scrolling ? 'shadow-md' : 'shadow-none'
        }`}
      >
        <div className="container relative mx-auto flex min-h-20 flex-row items-center justify-between gap-4 px-4 lg:px-8">
          {/* Logo on extreme left */}
          <div className="flex items-center">
            <Image
              src={MainLogo}
              alt="Campick Logo"
              width={150}
              height={80}
              priority
              className="cursor-pointer"
              onClick={() => router.push('/')}
            />
          </div>

          {/* Right Section: Icons */}
          <div className="flex items-center justify-end gap-2 lg:gap-4">
            {isLoggedIn && (
              <>
                {!hideCart && (
                  <Button
                    onClick={() => setIsCartOpen(true)}
                    className="relative rounded-full bg-transparent p-2"
                    variant="outline"
                  >
                    <ShoppingCart
                      className="h-5 w-5"
                      aria-label="Shopping Cart"
                    />
                    {cartItemCount > 0 && (
                      <div
                        className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white md:text-sm"
                        style={{ transform: 'translate(25%, -25%)' }}
                      >
                        {cartItemCount}
                      </div>
                    )}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={() => router.push('/orders')}
                >
                  <ClipboardList className="h-5 w-5" aria-label="Orders" />
                </Button>
                <UserMenu
                  userData={userData}
                  onLogout={userLogout}
                  router={router}
                />
              </>
            )}
            {!isLoggedIn && !loading && (
              <>
                <Button
                  variant="outline"
                  onClick={() => router.push('/signin')}
                >
                  Sign in
                </Button>
                <Button onClick={() => router.push('/signup')}>Sign up</Button>
              </>
            )}
          </div>
        </div>
      </header>

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        addToCart={addToCart}
        removeFromCart={removeFromCart}
      />
    </>
  );
};
