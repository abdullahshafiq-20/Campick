import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Loader } from '@/components/ui/loader';

interface OrderCardProps {
  order: {
    order_id: string;
    payment_id: string;
    created_at: string;
    status: string;
    total_price: number;
    payment_status: string;
    user_name: string;
    email: string;
    user_type: 'student' | 'teacher';
    items: {
      item_id: string;
      item_name: string;
      quantity: number;
      price: number;
      image_url?: string;
    }[];
  };
  onStatusUpdate: (orderId: string, status: string) => void;
  onPaymentStatusUpdate: (status: string) => void;
  onViewDetails: () => void;
  isUpdatingOrder?: boolean;
  isUpdatingPayment?: boolean;
}

const ORDER_STATUSES = [
  // 'pending',
  // 'preparing',
  'delivered',
  'rejected',
  'discarded'
];

const PAYMENT_STATUSES = [
  // 'pending',
  'verified',
  'rejected'
  // 'failed'
];

export function OrderCard({
  order,
  onStatusUpdate,
  onPaymentStatusUpdate,
  onViewDetails,
  isUpdatingOrder,
  isUpdatingPayment
}: OrderCardProps) {
  return (
    <Card className="p-4 transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative h-32 w-full flex-shrink-0 sm:h-20 sm:w-20">
          <Image
            src={order.items[0]?.image_url || '/placeholder.svg'}
            alt={order.items[0]?.item_name || 'Order item'}
            fill
            className="rounded-md object-cover"
          />
          {order.items.length > 1 && (
            <div className="absolute -bottom-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              +{order.items.length - 1}
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-0">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">Order #{order.order_id}</p>
                <Badge
                  variant={
                    order.user_type === 'student' ? 'default' : 'secondary'
                  }
                  className="text-xs"
                >
                  {order.user_type}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
            <p className="font-semibold">Rs. {order.total_price}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium">{order.user_name}</span>
            <span className="hidden text-muted-foreground sm:inline">•</span>
            <span className="text-muted-foreground">{order.email}</span>
          </div>

          <div className="rounded-md border-2 border-dashed border-primary/50 p-2">
            <p className="mb-1 text-sm font-medium">Order Items:</p>
            <div className="space-y-1">
              {order.items.map((item) => (
                <div
                  key={item.item_id}
                  className="flex flex-col gap-1 text-sm sm:flex-row sm:justify-between"
                >
                  <span className="font-medium">{item.item_name}</span>
                  <span className="text-muted-foreground">
                    {item.quantity} × Rs. {item.price}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 pt-2 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex h-[24px] min-w-[100px] items-center">
                {isUpdatingOrder ? (
                  <div className="flex w-full items-center justify-center">
                    <Loader size="sm" />
                  </div>
                ) : (
                  <StatusBadge status={order.status} type="order" />
                )}
              </div>
              <div className="flex h-[24px] min-w-[100px] items-center">
                {isUpdatingPayment ? (
                  <div className="flex w-full items-center justify-center">
                    <Loader size="sm" />
                  </div>
                ) : (
                  <StatusBadge status={order.payment_status} type="payment" />
                )}
              </div>
            </div>

            <div className="flex w-full flex-wrap gap-2 sm:ml-auto sm:w-auto">
              {onStatusUpdate && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      Order Status <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {ORDER_STATUSES.map((status) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => onStatusUpdate(order.order_id, status)}
                      >
                        {status}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {onPaymentStatusUpdate && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      Payment Status <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {PAYMENT_STATUSES.map((status) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => onPaymentStatusUpdate(status)}
                      >
                        {status}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {onViewDetails && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onViewDetails}
                  className="w-full sm:w-auto"
                >
                  <Eye className="mr-1 h-4 w-4" />
                  View Details
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
