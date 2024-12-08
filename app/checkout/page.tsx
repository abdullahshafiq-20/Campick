'use client';

import { Checkout } from '@/sections/checkout/view';
import { NavigationMenuDemo } from '@/components/navbar';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Loader } from '@/components/ui/loader';

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
          router.push('/signin');
        }
      } else {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        router.push('/signin');
      }
      setLoading(false);
    }

    authenticationCheck();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader size="lg" />
          <p className="text-sm text-muted-foreground">Loading checkout...</p>
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
      <div className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 pt-4">
          <Breadcrumbs
            items={[{ label: 'Checkout', href: '#', id: 'checkout' }]}
          />
        </div>
        <Checkout />
      </div>
    </div>
  );
}
