'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { NavigationMenuDemo } from '@/components/navbar';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { UploadButton } from '@/components/ui/upload-button';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface CartItem {
  name: string;
  item_id: string;
  quantity: number;
  description: string;
  price: number;
  shop_name: string;
  shop_id: string;
  image_url: string;
}

interface ShopPaymentDetails {
  type: string;
  details: string[];
}

export default function Checkout() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [totalUniqueItems, setTotalUniqueItems] = useState<number>(0);
  const [shopPaymentDetails, setShopPaymentDetails] =
    useState<ShopPaymentDetails>({
      type: '',
      details: []
    });
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<any>(null);
  const { toast } = useToast();
  const Router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      Router.push('/');
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    }

    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    setItems(cartItems);

    const total = cartItems.reduce(
      (acc: number, item: CartItem) => acc + item.price * item.quantity,
      0
    );
    setCartTotal(total);

    setTotalUniqueItems(cartItems.length);
    setLoading(false);
  }, []);

  const fetchShopPaymentDetails = async (shopId: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/shop/${shopId}/payment-details`
      );
      setShopPaymentDetails(response.data.methods[0]);
    } catch (error) {}
  };

  useEffect(() => {
    if (items.length > 0) {
      fetchShopPaymentDetails(items[0].shop_id);
    }
  }, [items]);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setIsUploading(true);
    try {
      const response = await axios.post(`${API_URL}/api/imageupload`, formData);
      setUploadedImage(response.data.data);
    } catch (error) {
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    setVerifying(true);
    if (!uploadedImage) {
      toast({
        title: 'Error',
        description: 'Please upload a payment screenshot',
        style: { backgroundColor: 'red', color: 'white' }
      });
      return;
    }

    const PaymentData = {
      payment_screenshot_url: uploadedImage.url,
      shop_id: items[0].shop_id,
      amount: cartTotal,
      payment_method: shopPaymentDetails.type,
      items: items
    };

    try {
      const response = await axios.post(
        `${API_URL}/api/verifyPaymentAndCreateOrder`,
        PaymentData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.status === 'success') {
        toast({
          title: 'Payment Verified and order placed',
          // description: 'Your payment has been verified successfully',
          style: { backgroundColor: 'green', color: 'white' }
        });
        localStorage.setItem('cartItems', JSON.stringify([]));
        setItems([]);
        setCartTotal(0);
        setTotalUniqueItems(0);
        setModalVisible(false);
      } else {
        toast({
          title: 'Payment Failed',
          description: 'Verification failed. Please try again.',
          style: { backgroundColor: 'red', color: 'white' }
        });
      }
    } catch (error: any) {
      setError(error.response.data.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    Router.push('/');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <NavigationMenuDemo
        isLoggedIn={isLoggedIn}
        loading={loading}
        onLogout={handleLogout}
        hideCart={true}
      />
      <div className="min-h-screen py-8 pt-20">
        <div className="container mx-auto px-4">
          <Breadcrumbs
            items={[{ label: 'Checkout', href: '#', id: 'checkout' }]}
          />

          <div className="mx-auto mt-8 max-w-xl">
            <Card className="rounded-lg border bg-transparent shadow-none">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Your order from {items[0]?.shop_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Order Items */}
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.item_id} className="flex items-center gap-4">
                      <Image
                        src={item.image_url || '/placeholder.svg'}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">
                              {item.quantity} × {item.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                          <p className="font-medium">
                            Rs. {item.price * item.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>Rs. {cartTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service fee</span>
                    <span>Rs. 0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VAT</span>
                    <span>Rs. 0.00</span>
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold">Total</p>
                      <p className="text-sm text-muted-foreground">
                        (incl. fees and tax)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        Rs. {cartTotal}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    setUploadedImage(null);
                    setError(null);
                    setModalVisible(true);
                  }}
                  disabled={items.length === 0}
                >
                  Pay Rs. {cartTotal}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {modalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Card className="relative w-96 rounded-lg border bg-white">
            <button
              onClick={() => setModalVisible(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>

            <CardHeader>
              <CardTitle>Verify Payment</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Payment Details */}
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Payment Method:</strong> {shopPaymentDetails.type}
                </p>
                <p className="text-sm">
                  <strong>Full Name:</strong> {shopPaymentDetails.details[0]}
                </p>
                <p className="text-sm">
                  <strong>Account Number:</strong>{' '}
                  {shopPaymentDetails.details[1]}
                </p>
                <p className="text-sm">
                  <strong>Contact Number:</strong>{' '}
                  {shopPaymentDetails.details[2]}
                </p>
                <p className="font-semibold">Total Amount: Rs. {cartTotal}</p>
              </div>

              <Separator />

              {/* Upload Section */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Upload Payment Proof
                </label>
                <UploadButton
                  preview={uploadedImage?.url}
                  onImageSelect={(file) => {
                    const formData = new FormData();
                    formData.append('image', file);
                    setIsUploading(true);
                    axios
                      .post(`${API_URL}/api/imageupload`, formData)
                      .then((response) => {
                        setUploadedImage(response.data.data);
                      })
                      .catch((error) => {
                        console.error('Upload error:', error);
                      })
                      .finally(() => {
                        setIsUploading(false);
                      });
                  }}
                  disabled={isUploading}
                  className="min-h-[150px]"
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
            </CardContent>

            <CardFooter className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setModalVisible(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={!uploadedImage || isUploading || verifying}
              >
                {verifying ? 'Verifying...' : 'Verify Payment'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
