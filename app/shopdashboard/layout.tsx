'use client';

import Header from '@/components/layout/header';
import Sidebar from '@/components/layout/sidebar';
import { useRouter } from 'next/navigation';
import {
  useEffect,
  useState,
  createContext,
  useContext,
  useCallback,
  useMemo
} from 'react';
import axios from 'axios';
import { VerifyEmailModal } from '@/components/verify-email-modal';
import jwtDecode from 'jsonwebtoken';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@radix-ui/react-toast';
import { useSocket } from '@/hooks/useSocket';
import { cn } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Create context for user data
export const UserDataContext = createContext<any>(null);

// Create context for orders
interface OrdersContextType {
  orders: OrderDetails[];
  setOrders: React.Dispatch<React.SetStateAction<OrderDetails[]>>;
  fetchOrders: () => Promise<void>;
}

export const OrdersContext = createContext<OrdersContextType | null>(null);

// Add this interface at the top of the file
interface UserData {
  shop_id?: string;
  is_verified?: number;
  [key: string]: any;
}

interface OrderItem {
  id: number;
  item_id: string;
  item_name: string;
  quantity: number;
  price: number;
  image_url?: string;
}

interface OrderDetails {
  order_id: string;
  payment_id: string;
  created_at: string;
  status: string;
  total_price: number;
  payment_status: string;
  user_id: string;
  user_name: string;
  email: string;
  items: OrderItem[];
  user_type: 'student' | 'teacher';
}

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Initialize socket with shop_id from userData
  const socket = useSocket(userData?.shop_id);

  // Fetch orders function - memoized to prevent recreation
  const fetchOrders = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.get(`${API_URL}/api/listShopOrders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const newOrders = response.data.orders.map((order: OrderDetails) => ({
        ...order,
        items: order.items || [],
        user_type: order.user_type || 'student'
      }));
      setOrders(newOrders);
      return newOrders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }, []); // No dependencies needed as it's a self-contained function

  // Modify the socket effect to only handle notifications
  useEffect(() => {
    if (!socket || !userData?.shop_id) return;

    const handleNewOrder = async (data: any) => {
      toast({
        title: 'New Order',
        description: `New order received! Order #${data.order_id}`
      });
    };

    const handleStatusUpdate = async (data: any) => {
      toast({
        title: 'Order Status Updated',
        description: `Order #${data.order_id} status updated to ${data.status}`
      });
    };

    socket.on(`shop_order_${userData.shop_id}`, handleNewOrder);
    socket.on(`order_status_update_${userData.shop_id}`, handleStatusUpdate);

    return () => {
      socket.off(`shop_order_${userData.shop_id}`, handleNewOrder);
      socket.off(`order_status_update_${userData.shop_id}`, handleStatusUpdate);
    };
  }, [socket, userData?.shop_id, toast]);

  // Initial user data fetch
  useEffect(() => {
    const validateToken = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }

      try {
        const parsedToken: any = jwtDecode.decode(token);
        if (parsedToken?.role !== 'shop_owner') {
          router.push('/');
        }
      } catch (error) {
        console.error('Invalid token:', error);
        router.push('/');
      }
    };

    validateToken();
  }, [router]);

  // Fetch user data
  useEffect(() => {
    const getUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        setLoading(true);
        const { data } = await axios.get(`${API_URL}/api/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setIsVerified(data.user.is_verified === 1 ? true : false);
        setUserData(data.user);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, []);

  // Initial orders fetch
  useEffect(() => {
    if (userData?.shop_id) {
      fetchOrders();
    }
  }, [userData?.shop_id, fetchOrders]);

  const ordersContextValue = useMemo(
    () => ({
      orders,
      setOrders,
      fetchOrders
    }),
    [orders, fetchOrders]
  );

  return (
    <UserDataContext.Provider value={{ userData, setUserData }}>
      <OrdersContext.Provider value={ordersContextValue}>
        <div className="flex min-h-screen overflow-hidden bg-background">
          {/* Mobile sidebar backdrop */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div
            className={cn(
              'fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen',
              isSidebarOpen
                ? 'translate-x-0'
                : '-translate-x-full lg:translate-x-0'
            )}
          >
            <Sidebar onClose={() => setIsSidebarOpen(false)} />
          </div>

          {/* Main content */}
          <main className="flex min-w-0 flex-1 flex-col">
            <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <Header
                onMenuClick={() => setIsSidebarOpen(true)}
                isSidebarOpen={isSidebarOpen}
              />
            </div>
            <div className="max-w-full flex-1 overflow-x-hidden p-4 md:p-6">
              {children}
            </div>
          </main>
        </div>
      </OrdersContext.Provider>
    </UserDataContext.Provider>
  );
}

// Export hooks to use the contexts
export const useUserData = () => useContext(UserDataContext);
export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
};
