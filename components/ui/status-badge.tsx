import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type StatusType = 'order' | 'payment';

interface StatusBadgeProps {
  status: string;
  type: StatusType;
  className?: string;
}

const ORDER_STATUS_STYLES = {
  preparing: 'border-yellow-500 bg-yellow-50 text-yellow-700',
  accepted: 'border-blue-500 bg-blue-50 text-blue-700',
  delivered: 'border-green-500 bg-green-50 text-green-700',
  rejected: 'border-red-500 bg-red-50 text-red-700',
  pending: 'border-yellow-500 bg-yellow-50 text-yellow-700',
  discarded: 'border-orange-500 bg-orange-50 text-orange-700'
};

const PAYMENT_STATUS_STYLES = {
  pending: 'border-yellow-500 bg-yellow-50 text-yellow-700',
  verified: 'border-green-500 bg-green-50 text-green-700',
  rejected: 'border-red-500 bg-red-50 text-red-700',
  failed: 'border-red-500 bg-red-50 text-red-700'
};

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();
  const styles = type === 'order' ? ORDER_STATUS_STYLES : PAYMENT_STATUS_STYLES;

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium capitalize',
        styles[normalizedStatus as keyof typeof styles] ||
          'border-gray-500 bg-gray-50 text-gray-700',
        className
      )}
    >
      {status}
    </Badge>
  );
}
