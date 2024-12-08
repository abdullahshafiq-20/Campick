'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { NavigationMenuDemo } from '@/components/navbar';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Breadcrumbs } from '@/components/breadcrumbs';
import Image from 'next/image';
import { OrderDetailsModal } from '@/components/order-details-modal';
import { Badge } from '@/components/ui/badge';
import { Loader } from '@/components/ui/loader';
import { StatusBadge } from '@/components/ui/status-badge';
import { useSocket } from '@/hooks/useSocket';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface OrderItem {
  id: number;
  item_id: string;
  item_name: string;
  quantity: number;
  price: number;
}

interface Order {
  order_id: string;
  shop_id: string;
  shop_name: string;
  shop_image: string;
  created_at: string;
  total_price: number | string;
  status: string;
  payment_status: string;
  items: OrderItem[];
}

export default function UserOrders() {
  const socket = useSocket();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
    }
    setIsLoggedIn(!!token);
    fetchOrders();

    // Socket event listeners for real-time updates
    if (socket) {
      // Listen for order status updates
      socket.on(
        'orderStatusUpdate',
        (data: { orderId: string; status: string }) => {
          toast({
            title: 'Order Status Updated',
            description: `Order #${data.orderId} status changed to ${data.status}`,
            duration: 3000
          });

          // Update orders state directly
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order.order_id === data.orderId
                ? { ...order, status: data.status }
                : order
            )
          );
        }
      );

      // Listen for payment status updates
      socket.on(
        'paymentStatusUpdate',
        (data: { orderId: string; status: string }) => {
          toast({
            title: 'Payment Status Updated',
            description: `Payment status for Order #${data.orderId} changed to ${data.status}`,
            duration: 3000
          });

          // Update orders state directly
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order.order_id === data.orderId
                ? { ...order, payment_status: data.status }
                : order
            )
          );
        }
      );

      // Listen for new orders (optional)
      socket.on('newOrder', (newOrder: Order) => {
        toast({
          title: 'New Order',
          description: `New order #${newOrder.order_id} has been placed`,
          duration: 3000
        });

        // Add new order to the state
        setOrders((prevOrders) => [newOrder, ...prevOrders]);
      });
    }

    // Cleanup socket listeners
    return () => {
      if (socket) {
        socket.off('orderStatusUpdate');
        socket.off('paymentStatusUpdate');
        socket.off('newOrder');
      }
    };
  }, [socket]);

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const { id } = JSON.parse(atob(token.split('.')[1]));
      const response = await axios.get(`${API_URL}/api/listUserOrders`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { id }
      });

      // Transform API data to match our interface
      const transformedOrders = await Promise.all(
        response.data.orders.map(async (order: any) => {
          const detailsResponse = await axios.get(
            `${API_URL}/api/orderDetails/${order.order_id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const shopResponse = await axios.get(
            `${API_URL}/api/shop/${order.shop_id}`
          );

          return {
            order_id: order.order_id,
            shop_id: order.shop_id,
            shop_name: shopResponse.data.name,
            shop_image: shopResponse.data.image_url || '/placeholder.svg',
            created_at: order.created_at,
            total_price: order.total_price,
            status: order.status,
            payment_status: order.payment_status,
            items: detailsResponse.data.items
          };
        })
      );

      setOrders(transformedOrders);
      console.log(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleReorder = async (order: Order) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Check if items are still available
      const availableItems = await Promise.all(
        order.items.map(async (item) => {
          try {
            const response = await axios.get(
              `${API_URL}/api/shop/${order.shop_id}/getMenuItem/${item.item_id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            return {
              ...item,
              available: true,
              current: response.data
            };
          } catch (error) {
            return { ...item, available: false };
          }
        })
      );

      // Add available items to cart
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const newCartItems = [...cartItems];

      availableItems.forEach((item) => {
        if (item.available && 'current' in item) {
          const cartItem = {
            item_id: item.item_id,
            name: item.item_name,
            price: item.current.price,
            description: item.current.description,
            image_url: item.current.image_url,
            quantity: item.quantity,
            shop_id: order.shop_id,
            shop_name: order.shop_name
          };
          newCartItems.push(cartItem);
        }
      });

      localStorage.setItem('cartItems', JSON.stringify(newCartItems));
      router.push(`/shop/${order.shop_id}`);
    } catch (error) {
      console.error('Error reordering items:', error);
    }
  };

  // Update the breadcrumb items
  const breadcrumbItems = [
    {
      label: 'Orders',
      href: '/orders',
      id: 'orders'
    }
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader size="lg" />
          {/* <p className="text-sm text-muted-foreground">Loading orders...</p> */}
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
        }}
      />
      <div className="flex-1 bg-background pt-20">
        <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
          <div className="mb-6">
            <Breadcrumbs items={breadcrumbItems} />
          </div>

          <div className="space-y-8">
            {/* Active Orders Section */}
            <section>
              <h2 className="mb-4 text-2xl font-bold">Active orders</h2>
              {orders.filter((order) =>
                ['preparing', 'accepted', 'pending'].includes(order.status)
              ).length === 0 ? (
                <p className="text-muted-foreground">
                  You have no active orders.
                </p>
              ) : (
                <div className="space-y-4">
                  {orders
                    .filter((order) =>
                      ['preparing', 'accepted', 'pending'].includes(
                        order.status
                      )
                    )
                    .map((order) => (
                      <div
                        key={order.order_id}
                        className="flex cursor-pointer flex-col items-start gap-4 rounded-lg border p-4 transition-colors hover:border-primary/50 sm:flex-row"
                        onClick={() => handleOrderClick(order)}
                      >
                        <Image
                          src={order.shop_image}
                          alt={order.shop_name}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                            <h3 className="text-lg font-semibold">
                              {order.shop_name}
                            </h3>
                            <p className="font-semibold">
                              Rs. {Number(order.total_price).toFixed(2)}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Order #{order.order_id}
                          </p>
                          <ul className="space-y-1">
                            {order.items.map((item, index) => (
                              <li key={index} className="text-sm">
                                {item.quantity}x {item.item_name}
                              </li>
                            ))}
                          </ul>
                          <div className="mt-2 flex gap-2">
                            <StatusBadge status={order.status} type="order" />
                            <StatusBadge
                              status={order.payment_status}
                              type="payment"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </section>

            {/* Past Orders Section */}
            <section>
              <h2 className="mb-4 text-2xl font-bold">Past orders</h2>
              <div className="space-y-4">
                {orders
                  .filter(
                    (order) =>
                      !['preparing', 'accepted', 'pending'].includes(
                        order.status
                      )
                  )
                  .map((order) => (
                    <div
                      key={order.order_id}
                      className="flex cursor-pointer flex-col items-start gap-4 rounded-lg border p-4 transition-colors hover:border-primary/50 sm:flex-row"
                      onClick={() => handleOrderClick(order)}
                    >
                      <Image
                        src={order.shop_image}
                        alt={order.shop_name}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                          <h3 className="text-lg font-semibold">
                            {order.shop_name}
                          </h3>
                          <p className="font-semibold">
                            Rs. {Number(order.total_price).toFixed(2)}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Delivered on {formatDate(order.created_at)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Order #{order.order_id}
                        </p>
                        <ul className="space-y-1">
                          {order.items.map((item, index) => (
                            <li key={index} className="text-sm">
                              {item.quantity}x {item.item_name}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-2 flex gap-2">
                          <StatusBadge status={order.status} type="order" />
                          <StatusBadge
                            status={order.payment_status}
                            type="payment"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Add the modal */}
      {selectedOrder && (
        <OrderDetailsModal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          order={selectedOrder}
          formatDate={formatDate}
        />
      )}
    </div>
  );
}
