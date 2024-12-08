'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';

import { CellAction } from './cell-action';

// Define CombinedOrderDetails type
interface OrderDetails {
  order_id: string;
  created_at: string;
  status: string;
  total_price: number;
  payment_status: string;
  user_id: string;
  user_name: string;
  email: string;
}

interface OrderItems {
  id: number;
  item_id: string;
  item_name: string;
  quantity: number;
  price: number;
  order_id: string;
}

// Define the combined type
interface CombinedOrderDetails extends OrderDetails {
  items: OrderItems[]; // Add 'items' property to OrderDetails
}

export const columns: ColumnDef<CombinedOrderDetails, unknown>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'user_name',
    header: 'NAME'
  },
  {
    accessorKey: 'email',
    header: 'EMAIL'
  },
  {
    accessorKey: 'total_price',
    header: 'TOTAL PRICE'
  },
  {
    accessorKey: 'payment_status',
    header: 'PAYMENT STATUS',
    cell: ({ row }) => {
      const paymentStatus = row.getValue('payment_status') as string;

      // Function to determine the appropriate class based on payment status
      const getPaymentStatusClass = (paymentStatus: string) => {
        switch (paymentStatus) {
          case 'verified':
            return 'text-green-500 font-semibold'; // Green for Paid
          case 'pending':
            return 'text-yellow-500 font-semibold'; // Yellow for Pending
          case 'rejected':
            return 'text-red-600 font-semibold'; // Red for Failed
          default:
            return 'text-black-500 font-semibold'; // Default color for other statuses
        }
      };

      return (
        <span className={getPaymentStatusClass(paymentStatus)}>
          {/* //uppercase all the letters */}
          {paymentStatus.toUpperCase()}
        </span>
      );
    }
  },
  {
    accessorKey: 'status',
    header: 'STATUS',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const getStatusClass = (status: string) => {
        switch (status) {
          case 'delivered':
            return 'text-green-500 font-semibold'; // Blinking green for Delivered
          case 'rejected':
            return 'text-red-600 font-semibold'; // Blinking red for Rejected
          case 'accepted':
            return 'text-yellow-500 blink font-semibold'; // Blinking yellow for Accepted
          case 'preparing':
            return 'text-blue-500 blink font-semibold'; // Blinking blue for Preparing
          case 'discarded':
            return 'text-gray-500 font-semibold'; // Blinking gray for Discarded
          default:
            return 'text-black-500 blink font-semibold'; // Default color for other statuses
        }
      };

      return (
        <span className={getStatusClass(status)}>{status.toUpperCase()}</span>
      );
    }
  },
  {
    accessorKey: 'created_at',
    header: 'CREATED AT',
    cell: ({ row }) => {
      const createdAt = new Date(row.original.created_at); // Convert to Date object
      const formattedDate = createdAt.toLocaleString('en-US', {
        weekday: 'short', // Day of the week, abbreviated (e.g., Mon)
        year: 'numeric', // Full year (e.g., 2024)
        month: 'short', // Abbreviated month (e.g., Nov)
        day: 'numeric', // Day of the month (e.g., 23)
        hour: '2-digit', // 2-digit hour (e.g., 08)
        minute: '2-digit', // 2-digit minute (e.g., 37)
        second: '2-digit', // 2-digit second (e.g., 44)
        hour12: true // Use 12-hour format with AM/PM
      });

      return <span>{formattedDate}</span>; // Display the formatted date
    }
  },
  {
    id: 'items',
    header: 'ITEMS',
    cell: ({ row }) => {
      const items = row.original.items;
      if (!items || items.length === 0) {
        return <span>No items</span>;
      }

      return (
        <details className="relative">
          <summary className="hover:cursor-pointer">View Items</summary>

          {/* Scrollable dropdown */}
          <div className="w-50 max-h-60 overflow-y-auto rounded-md border bg-white p-2 shadow-md">
            <ul className="space-y-2">
              {items
                .filter((item) => item.order_id === row.original.order_id) // Ensure items belong to the correct order
                .map((item) => (
                  <li key={item.id} className="list-disc">
                    {item.item_name} (x{item.quantity} Rs.{item.price})
                  </li>
                ))}
            </ul>
          </div>
        </details>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
