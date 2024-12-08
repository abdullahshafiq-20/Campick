'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NavigationMenuDemo } from '@/components/navbar';
import { CTA1 } from '@/components/cta';
import { MenuDisplay } from '@/components/menuitems';
import { Footer1 } from '@/components/footer';
import CheckoutSidebar from '@/components/cart-sidebar';
import axios from 'axios';
import Image from 'next/image';
import demoImg from '@/public/demoimg.png';
// import { socket } from '@/lib/socket';
import { useToast } from '@/hooks/use-toast';
import { Heart, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Loader } from '@/components/ui/loader';
import { cn } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
console.log(API_URL);

interface Shop {
  id: string;
  name: string;
  description: string;
  image_url: string;
  contact_number: string;
  is_open: boolean;
}

interface Promo {
  text: string;
  type: 'discount' | 'combo' | 'special';
}

function ShopCard({
  shop,
  handleShopClick,
  setImage
}: {
  shop: Shop;
  handleShopClick: (shop: Shop) => void;
  setImage: (url: string) => string;
}) {
  const [isFavorite, setIsFavorite] = useState(false);

  // Mock data for demonstration
  const mockData = {
    rating: 4.5,
    reviews: '200+',
    priceRange: 'Rs',
    category: 'Restaurant',
    deliveryTime: '30-40 min',
    minOrder: 'Min Rs 230',
    promos: [{ text: '50% OFF', type: 'discount' as const }]
  };

  return (
    <Card
      className="group cursor-pointer overflow-hidden border border-border bg-transparent shadow-none"
      onClick={() => handleShopClick(shop)}
    >
      <div className="relative">
        <Image
          src={setImage(shop.image_url)}
          alt={shop.name}
          width={400}
          height={200}
          className="h-48 w-full object-cover"
        />
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          <Badge
            variant="outline"
            className={cn(
              'whitespace-nowrap px-3 font-semibold',
              shop.is_open
                ? 'border-green-500 bg-green-100 text-green-700'
                : 'border-red-500 bg-red-100 text-red-700'
            )}
          >
            {shop.is_open ? 'Open Now' : 'Currently Closed'}
          </Badge>
          {/* {mockData.promos.map((promo, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-pink-500 text-white hover:bg-pink-500 whitespace-nowrap"
            >
              {promo.text}
            </Badge>
          ))} */}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute right-2 top-2 rounded-full bg-white/90 p-2 transition-colors hover:bg-white"
        >
          <Heart
            className={`h-5 w-5 ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
            }`}
          />
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-semibold">{shop.name}</h3>
        </div>
        <div className="mt-1 flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{mockData.rating}</span>
          <span className="text-muted-foreground">({mockData.reviews})</span>
          <span className="mx-1 text-muted-foreground">•</span>
          <span className="text-muted-foreground">{mockData.priceRange}</span>
          <span className="mx-1 text-muted-foreground">•</span>
          <span className="text-muted-foreground">{mockData.category}</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <span>{mockData.deliveryTime}</span>
          <span>•</span>
          <span>{mockData.minOrder}</span>
        </div>
      </div>
    </Card>
  );
}

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Tracks user authentication
  const shopsRef = useRef(null);
  const [loading, setLoading] = useState(true); // Controls loading state
  const [shops, setShops] = useState<Shop[]>([]); // Stores shop data
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null); // Tracks the selected shop

  const router = useRouter();

  const isTokenValid = (token: string) => {
    try {
      const { exp } = JSON.parse(atob(token.split('.')[1]));
      return Date.now() < exp * 1000; // Check if the token is still valid
    } catch (error) {
      console.error('Invalid token:', error);
      return false;
    }
  };
  const { toast } = useToast();

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/getAllShops`);
        setShops(response.data);
      } catch (error) {
        console.error('Error fetching shops:', error);
      }
      setLoading(false);
    };

    fetchShops();
  }, []);

  // Handles selecting a shop and updates state
  const handleShopClick = (shop: Shop) => {
    router.push(`/shop/${shop.id}`);
  };

  // Returns the correct image URL or a fallback demo image
  const setImage = (image_url: string) => {
    return image_url || demoImg.src;
  };

  // Checks for authentication token in local storage and decodes user role
  useEffect(() => {
    async function authenticationCheck() {
      const token = localStorage.getItem('token');

      if (token && isTokenValid(token)) {
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
        router.push('/'); // Redirect to login if invalid
      }
    }

    authenticationCheck();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar with dynamic login state */}
      <NavigationMenuDemo
        isLoggedIn={isLoggedIn}
        loading={loading}
        onLogout={handleLogout}
      />

      {/* Sidebar for checkout */}
      <CheckoutSidebar />
      {loading ? (
        <div className="flex h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader />
            {/* <p className="text-sm text-muted-foreground"></p> */}
          </div>
        </div>
      ) : (
        <div className="container mx-auto flex-1 overflow-auto px-4 py-8">
          <CTA1 isLoggedIn={isLoggedIn} shopsRef={shopsRef} />

          {/* Shops Section */}
          <div className="w-full pt-20 lg:py-10">
            <div className="container mx-auto flex flex-col gap-14">
              <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h4 className="max-w-xl text-3xl font-medium tracking-tighter md:text-5xl">
                  Visit Shops
                </h4>
              </div>
              <div className="-mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:mt-0 lg:grid-cols-3">
                {shops.length === 0 && (
                  <div className="flex w-full">
                    <h3 className="text-xl font-semibold text-foreground">
                      No shops available
                    </h3>
                  </div>
                )}

                {shops.map((shop) => (
                  <ShopCard
                    key={shop.id}
                    shop={shop}
                    handleShopClick={handleShopClick}
                    setImage={setImage}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Conditionally render menu or prompt */}
          {/* {selectedShop ? (
            <MenuDisplay ref={shopsRef} shop={selectedShop} />
          ) : (
            shops.length > 0 && (
              <div className="mt-8 flex w-full items-center justify-center">
                <h3 className="font-semibold text-foreground lg:text-xl">
                  Select a shop to view their menu
                </h3>
              </div>
            )
          )} */}
        </div>
      )}
      <Footer1 />
    </div>
  );
}
