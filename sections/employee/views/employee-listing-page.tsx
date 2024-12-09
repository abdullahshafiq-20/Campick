'use client';

import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Loader } from '@/components/ui/loader';
import { StatusBadge } from '@/components/ui/status-badge';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { OrderCard } from '@/components/ui/order-card';
import { useRouter } from 'next/navigation';
import { useOrders } from '@/app/shopdashboard/layout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSocket } from '@/hooks/useSocket';
import { LoaderSm } from '@/components/ui/loader';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
  items: {
    id: number;
    item_id: string;
    item_name: string;
    quantity: number;
    price: number;
    image_url?: string;
  }[];
  user_type: 'student' | 'teacher';
}

interface PaymentDetails {
  customerName: string;
  role: string;
  order: {
    orderId: string;
    status: string;
    orderDate: string;
    totalPrice: string;
  };
  payment: {
    method: string;
    screenshotUrl: string;
    geminiStatus: string;
    geminiResponse: {
      to: string;
      from: string;
      bankName: string;
      totalAmount: string;
    };
  };
}

export default function EmployeeListingPage() {
  const socket = useSocket();
  const { orders, fetchOrders } = useOrders();
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const [selectedPayment, setSelectedPayment] = useState<PaymentDetails | null>(
    null
  );
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [updatingPaymentId, setUpdatingPaymentId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchOrders();
      setLoading(false);
    };
    init();

    // Socket event listeners for real-time updates
    if (socket) {
      // Listen for new orders
      socket.on('newOrder', (newOrder: OrderDetails) => {
        fetchOrders(); // Refresh the orders list
      });

      // Listen for order status updates
      socket.on(
        'orderStatusUpdate',
        (updatedOrder: { orderId: string; status: string }) => {
          fetchOrders(); // Refresh the orders list
        }
      );

      // Listen for payment status updates
      socket.on(
        'paymentStatusUpdate',
        (updatedPayment: { orderId: string; status: string }) => {
          fetchOrders(); // Refresh the orders list
        }
      );
    }

    // Cleanup socket listeners
    return () => {
      if (socket) {
        socket.off('newOrder');
        socket.off('orderStatusUpdate');
        socket.off('paymentStatusUpdate');
      }
    };
  }, [socket]); // Add socket to dependency array

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      setUpdatingOrderId(orderId);
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/api/updateOrderStatus/${orderId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Emit socket event for status update
      if (socket) {
        socket.emit('orderStatusUpdate', { orderId, status });
      }

      await fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handlePaymentStatusUpdate = async (orderId: string, status: string) => {
    try {
      setUpdatingPaymentId(orderId);
      const token = localStorage.getItem('token');

      const paymentResponse = await axios.get(
        `${API_URL}/api/order/${orderId}/payment`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const paymentId = paymentResponse.data.data.payment_id;

      await axios.put(
        `${API_URL}/api/updatePaymentStatus/${orderId}`,
        {
          paymentId: paymentId,
          status: status
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Emit socket event for payment status update
      if (socket) {
        socket.emit('paymentStatusUpdate', { orderId, status });
      }

      await fetchOrders();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error updating payment status:', error.response?.data);
      }
    } finally {
      setUpdatingPaymentId(null);
    }
  };

  const handleViewDetails = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');

      // First get payment ID
      const paymentResponse = await axios.get(
        `${API_URL}/api/order/${orderId}/payment`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Extract payment_id from the correct path in response
      const paymentId = paymentResponse.data.data.payment_id;

      // Then get payment details
      const response = await axios.get(
        `${API_URL}/api/paymentDetails/${paymentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSelectedPayment(response.data.data);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error('Error fetching payment details:', error);
    }
  };

  // Calculate pagination values
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;

  // Get active and completed orders
  const activeOrders = orders.filter((order) =>
    ['pending', 'preparing'].includes(order.status)
  );
  const completedOrders = orders.filter((order) =>
    ['delivered', 'rejected', 'discarded'].includes(order.status)
  );

  // Get current page orders
  const currentActiveOrders = activeOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const currentCompletedOrders = completedOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );

  // Calculate total pages for each section
  const totalActivePages = Math.ceil(activeOrders.length / ordersPerPage);
  const totalCompletedPages = Math.ceil(completedOrders.length / ordersPerPage);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader size="lg" />
          {/* <p className="text-sm text-muted-foreground">/p> */}
        </div>
      </div>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Heading title="Orders" description="Manage your shop orders" />
        </div>

        {/* Order Type Selector */}
        <div className="flex gap-2 border-b border-border">
          <Button
            variant={activeTab === 'active' ? 'default' : 'ghost'}
            className="relative rounded-none border-b-2 border-transparent hover:border-border"
            onClick={() => setActiveTab('active')}
          >
            Active Orders
            {activeOrders.length > 0 && (
              <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground text-xs text-primary">
                {activeOrders.length}
              </span>
            )}
            {activeTab === 'active' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </Button>
          <Button
            variant={activeTab === 'completed' ? 'default' : 'ghost'}
            className="relative rounded-none border-b-2 border-transparent hover:border-border"
            onClick={() => setActiveTab('completed')}
          >
            Completed Orders
            {completedOrders.length > 0 && (
              <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground text-xs text-primary">
                {completedOrders.length}
              </span>
            )}
            {activeTab === 'completed' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </Button>
        </div>

        {/* Orders List */}
        <div className="pt-4">
          <div className="space-y-4">
            {activeTab === 'active' ? (
              <>
                {currentActiveOrders.map((order) => (
                  <OrderCard
                    key={order.order_id}
                    order={order}
                    onStatusUpdate={handleStatusUpdate}
                    onPaymentStatusUpdate={(status) =>
                      handlePaymentStatusUpdate(order.order_id, status)
                    }
                    onViewDetails={() => handleViewDetails(order.order_id)}
                    isUpdatingOrder={updatingOrderId === order.order_id}
                    isUpdatingPayment={updatingPaymentId === order.order_id}
                  />
                ))}

                {/* Pagination for Active Orders */}
                {activeOrders.length > ordersPerPage && (
                  <div className="mt-4 flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-2">
                      {Array.from(
                        { length: totalActivePages },
                        (_, i) => i + 1
                      ).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(totalActivePages, prev + 1)
                        )
                      }
                      disabled={currentPage === totalActivePages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <>
                {currentCompletedOrders.map((order) => (
                  <OrderCard
                    key={order.order_id}
                    order={order}
                    onStatusUpdate={handleStatusUpdate}
                    onPaymentStatusUpdate={(status) =>
                      handlePaymentStatusUpdate(order.order_id, status)
                    }
                    onViewDetails={() => handleViewDetails(order.order_id)}
                    isUpdatingOrder={updatingOrderId === order.order_id}
                    isUpdatingPayment={updatingPaymentId === order.order_id}
                  />
                ))}

                {/* Pagination for Completed Orders */}
                {completedOrders.length > ordersPerPage && (
                  <div className="mt-4 flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-2">
                      {Array.from(
                        { length: totalCompletedPages },
                        (_, i) => i + 1
                      ).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(totalCompletedPages, prev + 1)
                        )
                      }
                      disabled={currentPage === totalCompletedPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Payment Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="space-y-2">
                <h3 className="font-semibold">Customer Information</h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">
                      {selectedPayment.customerName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <Badge variant="outline" className="capitalize">
                      {selectedPayment.role}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div className="space-y-2">
                <h3 className="font-semibold">Order Information</h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Order ID</p>
                    <p className="font-medium">
                      {selectedPayment.order.orderId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Order Date</p>
                    <p className="font-medium">
                      {new Date(
                        selectedPayment.order.orderDate
                      ).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <StatusBadge
                      status={selectedPayment.order.status}
                      type="order"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Amount
                    </p>
                    <p className="font-medium">
                      Rs. {selectedPayment.order.totalPrice}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="space-y-2">
                <h3 className="font-semibold">Payment Information</h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Method</p>
                    <p className="font-medium capitalize">
                      {selectedPayment.payment.method}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Verification Status
                    </p>
                    <StatusBadge
                      status={selectedPayment.payment.geminiStatus}
                      type="payment"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">From</p>
                    <p className="font-medium">
                      {selectedPayment.payment.geminiResponse.from}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">To</p>
                    <p className="font-medium">
                      {selectedPayment.payment.geminiResponse.to}
                    </p>
                  </div>
                  <div className="col-span-full">
                    <p className="text-sm text-muted-foreground">Bank</p>
                    <p className="font-medium">
                      {selectedPayment.payment.geminiResponse.bankName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Screenshot */}
              <div className="space-y-2">
                <h3 className="font-semibold">Payment Screenshot</h3>
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={selectedPayment.payment.screenshotUrl}
                    alt="Payment screenshot"
                    fill
                    className="object-contain"
                  />
                </div>
                <Button
                  variant="outline"
                  className="mt-2 w-full"
                  onClick={() =>
                    window.open(selectedPayment.payment.screenshotUrl, '_blank')
                  }
                >
                  View Full Image
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
