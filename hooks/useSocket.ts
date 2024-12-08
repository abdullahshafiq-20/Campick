// hooks/useSocket.ts
import { useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { useToast } from '@/hooks/use-toast';

interface OrderNotification {
  type: 'new_order' | 'payment_update';
  order_id: string;
  customer_name: string;
  total_price: number;
  status: string;
  shop_name: string;
  timestamp: Date;
  items: Array<{
    item_name: string;
    quantity: number;
    price: number;
  }>;
}

interface PaymentUpdateNotification {
  type: 'payment_update';
  paymentId: string;
  orderId: string;
  status: string;
  orderStatus: string;
  timestamp: Date;
}

export const useSocket = (shopId?: string) => {
  const socket = useRef<Socket | null>(null);
  const { toast } = useToast();
  const backendUrl = process.env.NEXT_PUBLIC_API_URL;
  console.log(backendUrl);

  useEffect(() => {
    // Connect to your backend WebSocket server
    socket.current = io(backendUrl, {
      transports: ['websocket']
    });

    // Listen for new orders
    socket.current.on('newOrder', (data: OrderNotification) => {
      toast({
        title: 'New Order',
        description: `New order received from ${data.customer_name}!`
      });
    });

    // Listen for shop-specific orders if shopId is provided
    if (shopId) {
      socket.current.on(`shop_order_${shopId}`, (data: OrderNotification) => {
        toast({
          title: 'Shop Order',
          description: `New order for your shop: ${data.order_id}`
        });
      });

      socket.current.on(
        `shop_payment_${shopId}`,
        (data: PaymentUpdateNotification) => {
          toast({
            title: 'Payment Update',
            description: `Payment status updated for order: ${data.orderId}`
          });
        }
      );
    }

    // Listen for payment status updates
    socket.current.on(
      'paymentStatusUpdate',
      (data: PaymentUpdateNotification) => {
        toast({
          title: 'Payment Status Update',
          description: `Payment status updated to ${data.status}`
        });
      }
    );

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [shopId]);

  return socket.current;
};
