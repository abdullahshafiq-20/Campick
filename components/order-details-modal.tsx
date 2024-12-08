import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader } from '@/components/ui/loader';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    order_id: string;
    shop_id: string;
    shop_name: string;
    shop_image: string;
    created_at: string;
    total_price: number | string;
    status: string;
    payment_status: string;
    items: {
      id: number;
      item_id: string;
      item_name: string;
      quantity: number;
      price: number;
      image_url?: string;
    }[];
  };
  formatDate: (date: string) => string;
}

export function OrderDetailsModal({
  isOpen,
  onClose,
  order,
  formatDate
}: OrderDetailsModalProps) {
  const [itemImages, setItemImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchItemImages = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const images = await Promise.all(
          order.items.map(async (item) => {
            try {
              const response = await axios.get(
                `${API_URL}/api/shop/${order.shop_id}/getMenuItem/${item.item_id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              return { id: item.item_id, url: response.data.image_url };
            } catch (error) {
              return { id: item.item_id };
            }
          })
        );

        const imageMap = images.reduce(
          (acc, { id, url }) => {
            acc[id] = url;
            return acc;
          },
          {} as Record<string, string>
        );

        setItemImages(imageMap);
      } catch (error) {
        console.error('Error fetching item images:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchItemImages();
    }
  }, [isOpen, order.items, order.shop_id]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogTitle>Order Details</DialogTitle>
        <DialogDescription>
          Order #{order.order_id} from {order.shop_name}
        </DialogDescription>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{order.shop_name}</h2>
            <p className="text-sm text-muted-foreground">
              Order #{order.order_id}
            </p>
          </div>
          <Badge
            variant={
              order.status === 'preparing'
                ? 'warning'
                : order.status === 'accepted'
                ? 'success'
                : order.status === 'rejected'
                ? 'destructive'
                : order.status === 'delivered'
                ? 'default'
                : 'secondary'
            }
          >
            {order.status.toUpperCase()}
          </Badge>
        </div>

        <div className="mt-6">
          <div className="grid grid-cols-3 gap-4">
            {order.items.map((item) => (
              <div key={item.id} className="space-y-2">
                <div className="relative aspect-square overflow-hidden rounded-lg">
                  {loading ? (
                    <div className="flex h-full w-full items-center justify-center">
                      <Loader size="sm" />
                    </div>
                  ) : (
                    <Image
                      src={itemImages[item.item_id]}
                      alt={item.item_name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div>
                  <h3 className="truncate text-sm font-medium">
                    {item.item_name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} × Rs. {item.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Order Date</span>
            <span>{formatDate(order.created_at)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total Amount</span>
            <span>Rs. {Number(order.total_price).toFixed(2)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
