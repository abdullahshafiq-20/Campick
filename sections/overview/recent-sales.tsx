import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface RecentSalesProps {
  recentOrders: {
    email: string;
    user_name: string;
    total_price: number;
  }[];
}

export function RecentSales({ recentOrders }: RecentSalesProps) {
  if (!recentOrders || recentOrders.length === 0) {
    return <p>No recent sales available.</p>;
  }

  return (
    <div className="space-y-8">
      {recentOrders.map((order, index) => (
        <div key={index} className="flex items-center">
          <Avatar className="h-9 w-9">
            {/* Placeholder avatar image */}
            <AvatarImage src={`/avatars/${index + 1}.png`} alt="Avatar" />
            <AvatarFallback>{order.user_name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {order.user_name}
            </p>
            <p className="text-sm text-muted-foreground">{order.email}</p>
          </div>
          <div className="ml-auto font-medium">+Rs. {order.total_price}</div>
        </div>
      ))}
    </div>
  );
}
