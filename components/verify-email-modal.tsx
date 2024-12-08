'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useUserData } from '@/app/shopdashboard/layout';

interface VerifyEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResendOTP: () => void;
}

export function VerifyEmailModal({
  open,
  onOpenChange,
  onResendOTP
}: VerifyEmailModalProps) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { userData } = useUserData();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleVerify = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      await axios.post(
        `${API_URL}/api/verifyOTP`,
        {
          user_id: userData.id,
          otp: otp
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast({
        title: 'Success',
        description: 'Email verified successfully'
      });
      onOpenChange(false);
      window.location.reload();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid OTP',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verify your email</DialogTitle>
          <DialogDescription>
            Enter the verification code sent to your email
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <div className="flex flex-col gap-2">
            <Button onClick={handleVerify} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Email'}
            </Button>
            <Button variant="outline" onClick={onResendOTP} disabled={loading}>
              Resend OTP
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
