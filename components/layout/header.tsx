'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserData } from '@/app/shopdashboard/layout';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { VerifyEmailModal } from '@/components/verify-email-modal';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

export default function Header({ onMenuClick, isSidebarOpen }: HeaderProps) {
  const { userData } = useUserData();
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const { toast } = useToast();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleResendOTP = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/resend-otp`, {
        email: userData?.email
      });

      toast({
        title: 'Success',
        description: 'OTP has been sent to your email'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send OTP',
        variant: 'destructive'
      });
    }
  };

  return (
    <header className="w-full px-4 py-3">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between">
        {/* Left side with menu button */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="-ml-2 rounded-md p-2 hover:bg-accent lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Right side content */}
        <div className="flex items-center gap-2 sm:gap-4">
          {userData?.is_verified === 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowVerifyModal(true)}
              className="hidden whitespace-nowrap text-xs sm:inline-flex sm:text-sm"
            >
              Verify Email
            </Button>
          )}
          {/* Mobile verify button */}
          {userData?.is_verified === 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowVerifyModal(true)}
              className="p-2 text-xs sm:hidden"
            >
              Verify
            </Button>
          )}
          <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
            <AvatarImage
              src={userData?.imageURL || ''}
              alt={userData?.user_name || 'User'}
            />
            <AvatarFallback className="text-xs sm:text-sm">
              {userData?.user_name?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>

        <VerifyEmailModal
          open={showVerifyModal}
          onOpenChange={setShowVerifyModal}
          onResendOTP={handleResendOTP}
        />
      </div>
    </header>
  );
}
