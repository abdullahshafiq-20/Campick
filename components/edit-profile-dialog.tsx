import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Pencil } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { UploadButton } from '@/components/ui/upload-button';

interface EditProfileDialogProps {
  userData: any;
  onUpdate: () => void;
}

export function EditProfileDialog({
  userData,
  onUpdate
}: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    user_name: userData.name || '',
    email: userData.email || '',
    image_url: userData.image || ''
  });
  const [previewUrl, setPreviewUrl] = useState(userData.image || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const refreshProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await axios.get(`${API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      onUpdate();
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Profile refresh error:', error.response?.data);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      await axios.put(`${API_URL}/api/updateProfile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.'
      });

      await refreshProfile();
      setOpen(false); // Close the modal
    } catch (error) {
      if (error instanceof AxiosError) {
        toast({
          title: 'Error',
          description:
            error.response?.data?.message || 'Failed to update profile.',
          variant: 'destructive'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
          <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95%] max-w-lg p-4 sm:p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg sm:text-xl">Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={formData.user_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, user_name: e.target.value }))
              }
              className="h-9 text-sm sm:h-10 sm:text-base"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={formData.email}
              className="h-9 bg-muted text-sm sm:h-10 sm:text-base"
              disabled
              readOnly
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Profile Image</label>
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <UploadButton
                preview={previewUrl}
                onImageSelect={(file) => {
                  const formData = new FormData();
                  formData.append('image', file);
                  setIsUploading(true);

                  axios
                    .post(`${API_URL}/api/imageupload`, formData, {
                      headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                      }
                    })
                    .then((response) => {
                      const imageUrl = response.data.data.url;
                      setFormData((prev) => ({ ...prev, image_url: imageUrl }));
                      setPreviewUrl(imageUrl);
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
                className="w-full"
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="mt-2 h-9 w-full text-sm sm:h-10 sm:text-base"
          >
            {isLoading ? 'Updating...' : 'Update Profile'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
