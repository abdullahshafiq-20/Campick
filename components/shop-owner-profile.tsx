import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface ShopOwnerProfileProps {
  ownerData: {
    user_name: string;
    email: string;
    role: string;
    contact_number?: string;
    imageURL?: string;
    payment_details?: {
      account_title: string;
      payment_method: string;
      payment_details: string;
    };
  };
}

export function ShopOwnerProfile({ ownerData }: ShopOwnerProfileProps) {
  console.log(ownerData);
  if (!ownerData) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <div className="h-16 w-16 animate-pulse rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
        <Avatar className="h-16 w-16">
          <AvatarImage
            src={ownerData?.imageURL || ''}
            alt={ownerData?.user_name || 'User'}
          />
          <AvatarFallback>{ownerData?.user_name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <CardTitle className="text-xl">
            {ownerData?.user_name || 'User'}
          </CardTitle>
          <Badge variant="secondary" className="w-fit">
            {ownerData?.role || 'Shop Owner'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Contact Information
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="font-medium">Email:</span>
            <span>{ownerData.email}</span>
            {ownerData.contact_number && (
              <>
                <span className="font-medium">Phone:</span>
                <span>{ownerData.contact_number}</span>
              </>
            )}
          </div>
        </div>

        {ownerData.payment_details && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Payment Information
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="font-medium">Account Title:</span>
              <span>{ownerData.payment_details.account_title}</span>
              <span className="font-medium">Payment Method:</span>
              <span>{ownerData.payment_details.payment_method}</span>
              <span className="font-medium">Account Details:</span>
              <span>{ownerData.payment_details.payment_details}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
