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
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { UploadButton } from '@/components/ui/upload-button';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function UpdateMenuItem({
  shopId,
  menuItem
}: {
  shopId: string;
  menuItem: {
    item_id: string;
    name: string;
    description: string;
    price: string;
    image_url?: string;
  };
}) {
  const [editingMenuItem, setEditingMenuItem] = useState({
    id: menuItem.item_id || '',
    name: menuItem.name || '',
    description: menuItem.description || '',
    price: menuItem.price || '',
    image_url: menuItem.image_url || ''
  });

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<{ url: string } | null>(
    null
  );

  useEffect(() => {
    setEditingMenuItem({
      id: menuItem.item_id,
      name: menuItem.name,
      description: menuItem.description,
      price: menuItem.price,
      image_url: menuItem.image_url || ''
    });
  }, [menuItem]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setEditingMenuItem((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  const updateItem = async () => {
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }
      await axios.put(
        `${API_URL}/api/shop/${shopId}/updateMenuItem/${editingMenuItem.id}`,
        editingMenuItem,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setSuccess('Menu item updated successfully!');
      window.location.reload();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to update menu item. Please try again.'
      );
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Update</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Item</DialogTitle>
          <DialogDescription>
            Update your Menu item details here. Click &quot;Save&quot; when
            you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={editingMenuItem.name}
              onChange={handleChange}
              placeholder="Enter item name"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              value={editingMenuItem.description}
              onChange={handleChange}
              placeholder="Enter item description"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price Rs.
            </Label>
            <Input
              id="price"
              value={editingMenuItem.price}
              onChange={handleChange}
              placeholder="Enter item price"
              type="number"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">
              Image
            </Label>
            <div className="col-span-3">
              <UploadButton
                preview={uploadedImage?.url || editingMenuItem.image_url}
                onImageSelect={(file) => {
                  const formData = new FormData();
                  formData.append('image', file);
                  setIsUploading(true);
                  axios
                    .post(`${API_URL}/api/imageupload`, formData)
                    .then((response) => {
                      setUploadedImage(response.data.data);
                      setEditingMenuItem((prev) => ({
                        ...prev,
                        image_url: response.data.data.url
                      }));
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
          </div>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
        <DialogFooter>
          <Button
            onClick={() => {
              if (
                !editingMenuItem.name ||
                !editingMenuItem.description ||
                !editingMenuItem.price
              ) {
                setError('All fields are required.');
                return;
              }
              updateItem();
            }}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
