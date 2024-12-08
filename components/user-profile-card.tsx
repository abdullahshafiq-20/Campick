import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Mail,
  Phone,
  Package,
  CreditCard,
  Store,
  Calendar,
  Bell
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface OrderStats {
  total_orders: number;
  total_spent: number;
  completed_orders: number;
  cancelled_orders: number;
  active_orders: number;
}

interface FrequentShop {
  shop_name: string;
  shop_id: string;
  order_count: number;
  total_spent_at_shop: number;
}

interface UserProfileCardProps {
  userData: {
    id: string;
    user_name: string;
    email: string;
    role: string;
    contact_number?: string;
    imageURL?: string;
    alert_count?: number;
    is_verified?: boolean;
  };
  orderStats?: OrderStats;
  frequentShops?: FrequentShop[];
}

export function UserProfileCard({
  userData,
  orderStats,
  frequentShops
}: UserProfileCardProps) {
  console.log(userData);
  return (
    <Card className="mx-auto w-full max-w-4xl border bg-background p-8">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-8 md:flex-row">
          <div className="flex flex-col items-center gap-6 md:w-64">
            <Avatar className="h-40 w-40 border-2 border-border">
              <AvatarImage
                src={userData?.imageURL || ''}
                alt={userData?.user_name || 'User'}
              />
              <AvatarFallback className="text-4xl">
                {userData?.user_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="outline" className="text-sm capitalize">
                {userData.role}
              </Badge>
              {userData.is_verified ? (
                <Badge variant="success" className="text-sm">
                  Verified
                </Badge>
              ) : (
                <Badge variant="warning" className="text-sm">
                  Not Verified
                </Badge>
              )}
              {userData.alert_count !== undefined && (
                <Badge
                  variant={userData.alert_count > 0 ? "destructive" : "success"}
                  className="flex items-center gap-1"
                >
                  <Bell className="h-3 w-3" />
                  {userData.alert_count > 0 
                    ? `${userData.alert_count} Alert${userData.alert_count !== 1 ? 's' : ''}`
                    : 'No Alerts'
                  }
                </Badge>
              )}
              <Badge variant="secondary">ID: {userData.id}</Badge>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">
                  {userData?.user_name || 'User'}
                </h2>
                {/* {userData?.alert_count && userData.alert_count > 0 && (
                  <Badge
                    variant="destructive"
                    className="flex items-center gap-1"
                  >
                    <Bell className="h-3 w-3" />
                    {userData.alert_count} Alert
                    {userData.alert_count !== 1 ? 's' : ''}
                  </Badge>
                )} */}
              </div>
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{userData.email}</span>
                </div>
                {userData.contact_number && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{userData.contact_number}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Stats Summary */}
            {orderStats && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span className="text-sm">Total Orders</span>
                  </div>
                  <p className="text-xl font-bold">{orderStats.total_orders}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    <span className="text-sm">Total Spent</span>
                  </div>
                  <p className="text-xl font-bold">
                    Rs. {orderStats.total_spent.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Alert Details Section */}
        {userData?.alert_count && userData.alert_count > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-destructive" />
                <h3 className="text-lg font-semibold text-destructive">
                  Active Alerts
                </h3>
              </div>
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
                <p className="text-sm text-destructive">
                  You have {userData.alert_count} active alert
                  {userData.alert_count !== 1 ? 's' : ''}. Next time be careful
                  or you will be banned.
                </p>
              </div>
            </div>
          </>
        )}

        {/* Order Statistics Section */}
        {orderStats && (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Order Statistics</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Active Orders</p>
                  <p className="text-2xl font-bold">
                    {orderStats.active_orders}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">
                    Completed Orders
                  </p>
                  <p className="text-2xl font-bold">
                    {orderStats.completed_orders}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">
                    Cancelled Orders
                  </p>
                  <p className="text-2xl font-bold">
                    {orderStats.cancelled_orders}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Frequent Shops Section */}
        {frequentShops && frequentShops.length > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Frequent Shops</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {frequentShops.map((shop) => (
                  <div key={shop.shop_id} className="rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{shop.shop_name}</p>
                    </div>
                    <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                      <span>{shop.order_count} orders</span>
                      <span>Rs. {shop.total_spent_at_shop.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
