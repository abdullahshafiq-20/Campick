'use client';

import { BarGraph } from '../bar-graph';
import PageContainer from '@/components/layout/page-container';
import { RecentSales } from '../recent-sales';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useUserData } from '@/app/shopdashboard/layout';
import { Loader } from '@/components/ui/loader';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface DashboardData {
  revenue: string;
  shopDetails: {
    total_orders: number;
    average_order_value: string;
    total_menu_items: number;
    // ... other shop details
  };
  topSellingItems: {
    items: Array<{
      item_id: string;
      name: string;
      unit_price: string;
      total_quantity_sold: string;
    }>;
  };
  recentOrders: Array<{
    order_id: string;
    total_price: string;
    status: string;
    created_at: string;
    user_id: string;
    user_name: string;
    email: string;
  }>;
  revenueOverTime: Array<{
    date: string;
    daily_revenue: string;
  }>;
}

export default function OverViewPage() {
  const { userData } = useUserData();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    revenue: '0',
    shopDetails: {
      total_orders: 0,
      average_order_value: '0',
      total_menu_items: 0
    },
    topSellingItems: { items: [] },
    recentOrders: [],
    revenueOverTime: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found. Please login.');
        setLoading(false);
        return;
      }

      try {
        // Fetch shops
        const shopsResponse = await axios.get(`${API_URL}/api/ownerShops`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const shops = shopsResponse.data.shops;

        if (shops.length > 0) {
          const shopId = shops[0].id;

          // Fetch dashboard data
          const dashboardResponse = await axios.get(
            `${API_URL}/api/shopDashboard/${shopId}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          console.log(dashboardResponse.data);

          const deliveredOrders = dashboardResponse.data.recentOrders.filter(
            (order: any) => order.status === 'delivered'
          );

          setDashboardData({
            revenue: dashboardResponse.data.revenue,
            shopDetails: {
              total_orders: dashboardResponse.data.shopDetails.total_orders,
              average_order_value:
                dashboardResponse.data.shopDetails.average_order_value,
              total_menu_items:
                dashboardResponse.data.shopDetails.total_menu_items
            },
            topSellingItems: dashboardResponse.data.topSellingItems,
            recentOrders: dashboardResponse.data.recentOrders,
            revenueOverTime: dashboardResponse.data.revenueOverTime
          });
        } else {
          setError('No shops found for this owner.');
        }

        // Fetch profile data
        const profileResponse = await axios.get(`${API_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log(profileResponse.data);
      } catch (err) {
        setError('Failed to fetch data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <PageContainer scrollable={false}>
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Hi, {userData?.user_name || 'there'}!
          </h2>
        </div>
        <div className="flex h-screen items-center justify-center">
          <h2 className="text-2xl font-semibold text-red-600">{error}</h2>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer scrollable={true}>
      <div className="space-y-2">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Hi, {userData?.user_name || 'there'}!
          </h2>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    Rs. {Number(dashboardData.revenue).toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData.shopDetails.total_orders}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Order Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    Rs.{' '}
                    {Number(
                      dashboardData.shopDetails.average_order_value
                    ).toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Menu Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData.shopDetails.total_menu_items}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
              <div className="col-span-4">
                <BarGraph revenueData={dashboardData.revenueOverTime} />
              </div>
              <Card className="col-span-4 md:col-span-3">
                <CardHeader>
                  <CardTitle>Recent Sales</CardTitle>
                  <CardDescription>
                    You made {dashboardData.recentOrders.length} sales recently.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSales
                    recentOrders={dashboardData.recentOrders.map((order) => ({
                      email: order.email,
                      user_name: order.user_name,
                      total_price: Number(order.total_price)
                    }))}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
