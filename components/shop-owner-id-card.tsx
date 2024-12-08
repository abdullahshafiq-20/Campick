import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { QrCode, Mail, Phone, Calendar, Shield, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { EditProfileDialog } from '@/components/edit-profile-dialog';

interface ShopOwnerIdCardProps {
  ownerData: {
    user_name: string;
    email: string;
    role: string;
    id: string;
    contact_number?: string;
    imageURL?: string;
    joined_date?: string;
  };
}

export function ShopOwnerIdCard({ ownerData }: ShopOwnerIdCardProps) {
  return (
    <Card className="mx-auto w-full max-w-4xl border bg-background p-4 sm:p-8">
      <div className="flex flex-col gap-6 sm:gap-8 md:flex-row">
        {/* Left Section - Avatar and Badges */}
        <div className="flex w-full flex-col items-center gap-4 sm:gap-6 md:w-64">
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <Avatar className="h-28 w-28 border-2 border-border sm:h-40 sm:w-40">
              <AvatarImage
                src={ownerData?.imageURL || ''}
                alt={ownerData?.user_name || 'User'}
              />
              <AvatarFallback className="text-2xl sm:text-4xl">
                {ownerData?.user_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="outline" className="text-xs sm:text-sm">
                Shop Owner
              </Badge>
              <Badge variant="success" className="text-xs sm:text-sm">
                Verified
              </Badge>
            </div>
          </div>
        </div>

        {/* Right Section - Details */}
        <div className="flex-1 space-y-4 sm:space-y-6">
          {/* Header with Name */}
          <div className="space-y-3">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <h2 className="text-xl font-bold sm:text-2xl">
                {ownerData?.user_name || 'User'}
              </h2>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs sm:text-sm">
                  ID: {ownerData.id}
                </Badge>
                <EditProfileDialog userData={ownerData} onUpdate={() => {}} />
              </div>
            </div>

            {/* Contact Info with Icons */}
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="break-all">{ownerData.email}</span>
              </div>
              {ownerData.contact_number && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{ownerData.contact_number}</span>
                </div>
              )}
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="flex items-center gap-1 text-xs sm:text-sm"
            >
              <Calendar className="h-3 w-3" />
              Joined {ownerData.joined_date || 'N/A'}
            </Badge>
            <Badge
              variant="outline"
              className="flex items-center gap-1 text-xs sm:text-sm"
            >
              <Shield className="h-3 w-3" />
              Active Account
            </Badge>
            <Badge
              variant="outline"
              className="flex items-center gap-1 text-xs sm:text-sm"
            >
              <MapPin className="h-3 w-3" />
              Campus Partner
            </Badge>
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs sm:text-sm">
                Premium Vendor
              </Badge>
              <Badge variant="secondary" className="text-xs sm:text-sm">
                Fast Delivery
              </Badge>
            </div>
            <QrCode className="h-6 w-6 text-muted-foreground/50 sm:h-8 sm:w-8" />
          </div>
        </div>
      </div>
    </Card>
  );
}
