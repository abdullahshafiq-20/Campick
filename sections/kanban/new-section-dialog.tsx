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
import axios from 'axios';
import { set } from 'date-fns';
import { useState } from 'react';
import { UploadButton } from '@/components/ui/upload-button';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const paymentMethods = ['jazzcash', 'easypaisa', 'sadapay', 'nayapay'];

export default function NewSectionDialog() {
  const [error, setError] = useState('');
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
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creatingShop, setCreatingShop] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);

  const checkUserVerification = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No token found. Please login.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/api/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Verification response:', response.data);

      if (
        response.data.user.is_verified === 1 ||
        response.data.user.is_verified === true
      ) {
        setIsVerified(true);
        setShowDialog(true);
        setError('');
      } else {
        setIsVerified(false);
        setError('Please verify your account first.');
        setShowDialog(true);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Failed to verify user.');
      setIsVerified(false);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setNewShop((prevShop) => ({
      ...prevShop,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      setError('No token found. Please login.');
      return;
    }
    setCreatingShop(true);

    try {
      await axios.post(`${API_URL}/api/createShop`, newShop, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      window.location.reload();
      setError('');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to create shop. Please try again.'
      );
    }
    setCreatingShop(false);
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setIsUploading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/imageupload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Image upload response:', response.data);

      if (response.data.data?.url) {
        setUploadedImage(response.data.data);
        handleInputChange('image_url', response.data.data.url);
      } else {
        throw new Error('Image URL not received');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={checkUserVerification}
        >
          {loading ? 'Loading...' : '＋ Add New Shop'}
        </Button>
      </DialogTrigger>
      {isVerified ? (
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Shop</DialogTitle>
            <DialogDescription>Enter the details of the shop</DialogDescription>
          </DialogHeader>
          <form
            id="shop-form"
            className="grid gap-4 py-4"
            onSubmit={handleSubmit}
          >
            <Input
              id="name"
              value={newShop.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Shop Name..."
              required
            />
            <Input
              id="description"
              value={newShop.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Shop Description..."
              required
            />
            <UploadButton
              onImageSelect={handleImageUpload}
              preview={uploadedImage?.url}
              isLoading={isUploading}
              className="w-full"
            />
            <Input
              id="email"
              value={newShop.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Email..."
              required
            />

            <Input
              id="contact_number"
              value={newShop.contact_number}
              onChange={(e) =>
                handleInputChange('contact_number', e.target.value)
              }
              placeholder="Contact Number..."
              required
            />
            <Input
              id="full_name"
              value={newShop.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="Full Name..."
              required
            />
            <Input
              id="account_title"
              value={newShop.account_title}
              onChange={(e) =>
                handleInputChange('account_title', e.target.value)
              }
              placeholder="Account Title..."
            />
            <div>
              <label>Select Payment Method:</label>
              <div className="flex gap-2">
                {paymentMethods.map((method) => (
                  <label key={method} className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="payment_method"
                      value={method}
                      checked={newShop.payment_method === method}
                      onChange={(e) =>
                        handleInputChange('payment_method', e.target.value)
                      }
                    />
                    {method}
                  </label>
                ))}
              </div>
            </div>
            <Input
              id="payment_details"
              value={newShop.payment_details}
              onChange={(e) =>
                handleInputChange('payment_details', e.target.value)
              }
              placeholder="Payment Details..."
            />
          </form>
          {error && <div className="text-red-500">{error}</div>}
          <DialogFooter>
            <Button type="submit" size="sm" form="shop-form">
              {creatingShop ? 'Creating...' : 'Create Shop'}
            </Button>
          </DialogFooter>
        </DialogContent>
      ) : (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verification Required</DialogTitle>
            <DialogDescription>
              You need to verify your account before creating a shop.
            </DialogDescription>
          </DialogHeader>
          <p className="text-red-500">{error}</p>
        </DialogContent>
      )}
    </Dialog>
  );
}
