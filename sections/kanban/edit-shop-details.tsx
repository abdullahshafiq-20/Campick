'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { FaEdit } from 'react-icons/fa'; // Import the edit icon
import axios from 'axios';
import { useEffect, useState } from 'react';
import { UploadButton } from '@/components/ui/upload-button';
import { useToast } from '@/hooks/use-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const paymentMethods = ['jazzcash', 'easypaisa', 'sadapay', 'nayapay'];

export default function EditShopDetails({
  shopId,
  shopData
}: {
  shopId: string;
  shopData: {
    name: string;
    description: string;
    image_url: string;
    email: string;
    contact_number: string;
    full_name: string;
    account_title: string;
    payment_method: string;
    payment_details: string;
  } | null;
}) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [newShop, setNewShop] = useState({
    name: '',
    description: '',
    image_url: '',
    email: '',
    contact_number: '',
    full_name: '',
    account_title: '',
    payment_method: '',
    payment_details: ''
  });

  useEffect(() => {
    if (shopData && shopData.name !== newShop.name) {
      setNewShop(shopData);
    }
  }, [shopData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewShop((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditShopDetails = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('No token found. Please login.');
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/api/updateshop/${shopId}`,
        newShop,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setSuccess('Shop details updated successfully.');
      window.location.reload();
    } catch (error) {
      setError('Failed to update shop details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="text-gray-500 hover:text-blue-500"
          title="Edit Shop Details"
          aria-label="Edit Shop"
        >
          <FaEdit size={20} className="h-5 w-5 sm:h-[21px] sm:w-[21px]" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] w-[95%] gap-3 overflow-y-auto rounded-lg p-4 sm:max-w-[425px] sm:p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg sm:text-xl">
            Edit Shop Details
          </DialogTitle>
          <DialogDescription className="text-sm">
            Edit the details of the shop
          </DialogDescription>
        </DialogHeader>
        <form
          id="edit-shop-form"
          className="grid gap-3 py-2 sm:gap-4 sm:py-4"
          onSubmit={handleEditShopDetails}
        >
          <div className="grid grid-cols-4 items-center gap-3 sm:gap-4">
            <div className="col-span-4 space-y-1.5">
              <label className="text-sm font-medium" htmlFor="name">
                Shop Name
              </label>
              <Input
                id="name"
                name="name"
                value={newShop.name}
                onChange={handleChange}
                placeholder="Enter shop name..."
                className="col-span-4"
                required
              />
            </div>

            <div className="col-span-4 space-y-1.5">
              <label className="text-sm font-medium" htmlFor="description">
                Description
              </label>
              <Input
                id="description"
                name="description"
                value={newShop.description}
                onChange={handleChange}
                placeholder="Enter shop description..."
                className="col-span-4"
                required
              />
            </div>

            <div className="col-span-4 space-y-1.5">
              <label className="text-sm font-medium">Shop Image</label>
              <div className="w-full">
                <UploadButton
                  preview={newShop.image_url}
                  onImageSelect={(file) => {
                    const formData = new FormData();
                    formData.append('image', file);
                    setIsUploading(true);

                    axios
                      .post(`${API_URL}/api/imageupload`, formData, {
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem(
                            'token'
                          )}`
                        }
                      })
                      .then((response) => {
                        const imageUrl = response.data.data.url;
                        setNewShop((prev) => ({
                          ...prev,
                          image_url: imageUrl
                        }));
                        toast({
                          title: 'Success',
                          description: 'Image uploaded successfully'
                        });
                      })
                      .catch((error) => {
                        console.error('Upload error:', error);
                        toast({
                          title: 'Error',
                          description: 'Failed to upload image',
                          variant: 'destructive'
                        });
                      })
                      .finally(() => {
                        setIsUploading(false);
                      });
                  }}
                  isLoading={isUploading}
                />
              </div>
            </div>

            <div className="col-span-4 space-y-3">
              <h3 className="pt-2 text-sm font-semibold">
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="email">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newShop.email}
                    onChange={handleChange}
                    placeholder="Enter email address..."
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    className="text-sm font-medium"
                    htmlFor="contact_number"
                  >
                    Contact Number
                  </label>
                  <Input
                    id="contact_number"
                    name="contact_number"
                    value={newShop.contact_number}
                    onChange={handleChange}
                    placeholder="Enter contact number..."
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="full_name">
                    Full Name
                  </label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={newShop.full_name}
                    onChange={handleChange}
                    placeholder="Enter full name..."
                    required
                  />
                </div>
              </div>
            </div>

            <div className="col-span-4 space-y-3">
              <h3 className="pt-2 text-sm font-semibold">
                Payment Information
              </h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label
                    className="text-sm font-medium"
                    htmlFor="account_title"
                  >
                    Account Title
                  </label>
                  <Input
                    id="account_title"
                    name="account_title"
                    value={newShop.account_title}
                    onChange={handleChange}
                    placeholder="Enter account title..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Payment Method</label>
                  <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                    {paymentMethods.map((method) => (
                      <div key={method} className="flex items-center gap-2">
                        <input
                          type="radio"
                          id={method}
                          name="payment_method"
                          value={method}
                          checked={newShop.payment_method === method}
                          onChange={handleChange}
                          className="h-4 w-4"
                        />
                        <label htmlFor={method} className="text-sm capitalize">
                          {method}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    className="text-sm font-medium"
                    htmlFor="payment_details"
                  >
                    Payment Details
                  </label>
                  <Input
                    id="payment_details"
                    name="payment_details"
                    value={newShop.payment_details}
                    onChange={handleChange}
                    placeholder="Enter payment details..."
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        {error && <div className="text-sm text-red-500">{error}</div>}
        {success && <div className="text-sm text-green-500">{success}</div>}

        <DialogFooter className="sm:mt-2">
          <Button
            type="submit"
            form="edit-shop-form"
            disabled={isUploading || loading}
            className="w-full sm:w-auto"
          >
            {isUploading || loading ? 'Updating...' : 'Update Shop'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
