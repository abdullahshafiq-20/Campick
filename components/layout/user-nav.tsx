'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function UserNav() {
  const router = useRouter();
  const [data, setData] = useState({
    email: '',
    id: null,
    role: '',
    name: '',
    image: '' // Image for the avatar
  });

  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setData({
          email: response.data.email,
          id: response.data.id,
          role: response.data.role,
          name: response.data.user_name,
          image: response.data.image // Ensure your backend sends this field
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        router.push(''); // Redirect to login if user is unauthorized
      }
    };

    if (token) {
      fetchProfile();
    } else {
      router.push('/'); // Redirect if no token is found
    }
  }, [router]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            {data.image ? (
              <AvatarImage src={data.image} alt={data.name} />
            ) : (
              <AvatarFallback>
                {data.name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {data.name || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {data.email || 'No email available'}
            </p>
          </div>
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
``;
