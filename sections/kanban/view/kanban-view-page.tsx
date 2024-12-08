'use client';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { AllShops } from '../kanban-board';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { set } from 'date-fns';
import { ShopOwnerProfile } from '@/components/shop-owner-profile';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const breadcrumbItems = [
  { label: 'Dashboard', href: '/dashboard', id: 'dashboard' },
  { label: 'Shops', href: '/dashboard/shops', id: 'shops' }
];

export default function KanbanViewPage() {
  const [error, setError] = useState('');
  const [shopExists, setShopExists] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchShopsdata = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found. Please login.');
        return;
      }

      try {
        const shopsResponse = await axios.get(`${API_URL}/api/ownerShops`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const shops = shopsResponse.data.shops;

        if (shops.length > 0) {
          setShopExists(true);
        } else {
          setError('No shops found for this owner.');
          setShopExists(false);
        }
      } catch (error) {
        setError('Failed to fetch data. Please try again.');
      }
    };
    fetchShopsdata();
  }, []); // Run once when the component mounts

  useEffect(() => {
    // Get user data from token
    const token = localStorage.getItem('token');
    if (token) {
      const user = JSON.parse(atob(token.split('.')[1]));
      setUserData(user);
    }
  }, []);

  return (
    <PageContainer>
      <div className="space-y-4 sm:space-y-8">
        {/* <Breadcrumbs items={breadcrumbItems} /> */}

        {/* Only Shop Details */}
        <div className="w-full">
          <div className="mb-2 flex items-start justify-between sm:mb-4">
            <Heading
              title="Shop Details"
              description="Manage your shop and their menu items."
            />
          </div>
          <div className="rounded-lg border bg-background p-2 sm:p-4">
            <AllShops shopExists={shopExists} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
