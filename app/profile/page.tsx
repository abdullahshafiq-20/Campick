'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NavigationMenuDemo } from '@/components/navbar';
import { UserProfileCard } from '@/components/user-profile-card';
import { Breadcrumbs } from '@/components/breadcrumbs';
import axios from 'axios';
import { Loader } from '@/components/ui/loader';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [orderStats, setOrderStats] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/signin');
        return;
      }

      try {
        // Get user ID from token
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role === 'shop_owner') {
          router.push('/shopdashboard');
          return;
        }

        // Fetch user profile and order stats
        const [profileResponse, statsResponse] = await Promise.all([
          axios.get(`${API_URL}/api/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/api/user/order-stats`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (profileResponse.data.success && statsResponse.data.success) {
          setUserData(profileResponse.data.user);
          console.log(statsResponse.data.data);
          setOrderStats({
            stats: statsResponse.data.data.orderStats,
            frequentShops: statsResponse.data.data.frequentShops
          });
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        router.push('/signin');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <NavigationMenuDemo
        isLoggedIn={isLoggedIn}
        loading={loading}
        onLogout={() => {
          localStorage.removeItem('token');
          setIsLoggedIn(false);
          router.push('/');
        }}
      />
      <div className="flex-1 bg-background pt-14 sm:pt-20">
        <div className="container mx-auto px-2 text-[10px] sm:px-6 sm:text-xs md:text-sm lg:px-8">
          <div className="mt-4 block sm:mt-6">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/', id: 'home' },
                { label: 'Profile', href: '/profile', id: 'profile' }
              ]}
            />
          </div>

          <div className="mt-4 py-3 sm:py-8">
            {userData && (
              <UserProfileCard
                userData={userData}
                orderStats={orderStats?.stats}
                frequentShops={orderStats?.frequentShops}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
