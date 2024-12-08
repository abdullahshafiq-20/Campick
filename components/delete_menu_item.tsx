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
import axios from 'axios';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function DeleteItem({
  shopId,
  itemId
}: {
  shopId: string;
  itemId: string;
}) {
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const deleteItem = async () => {
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token'); // Retrieve token inside the function
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      await axios.delete(
        `${API_URL}/api/shop/${shopId}/deleteMenuItem/${itemId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccess('Menu item deleted successfully!');
      // Reload the page or refetch the data after the deletion
      window.location.reload();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to delete menu item. Please try again.'
      );
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Item</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this menu item? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}
        </div>
        <DialogFooter className="gap-2">
          <Button onClick={deleteItem} variant="destructive">
            Confirm Delete
          </Button>
          <Button variant="outline">Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
