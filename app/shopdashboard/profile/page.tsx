'use client';

import { ShopOwnerIdCard } from '@/components/shop-owner-id-card';
import { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const response = await axios.get(`${API_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('API Response:', response.data);

        setUserData({
          ...response.data.user,
          joined_date: new Date().toLocaleDateString()
        });
      } catch (error) {
        if (error instanceof AxiosError) {
          console.error('Error response:', error.response?.data);
        }
        console.error('Profile fetch error:', error);

        toast({
          title: 'Error',
          description: 'Failed to load profile data',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [API_URL, toast]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 text-3xl font-bold">My Profile</h1>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold">My Profile</h1>
        {userData && <ShopOwnerIdCard ownerData={userData} />}
      </div>
    </div>
  );
}
