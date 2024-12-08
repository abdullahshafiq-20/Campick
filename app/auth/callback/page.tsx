// app/auth/callback/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const CallbackPage = () => {
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token && typeof token === 'string') {
      // Validate and store token
      if (isTokenValid(token)) {
        localStorage.setItem('token', token);
        router.push('/');
      } else {
        router.push('/'); // Redirect to login if the token is invalid
      }
    }
  }, [router]);

  const isTokenValid = (token: string): boolean => {
    try {
      const { exp } = JSON.parse(atob(token.split('.')[1]));
      return Date.now() < exp * 1000;
    } catch (error) {
      console.error('Invalid token:', error);
      return false;
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-16 w-16 animate-spin rounded-full border-b-4 border-t-4 border-blue-500"></div>
        <h2 className="text-2xl font-semibold">Loading</h2>
      </div>
    </div>
  );
};

export default CallbackPage;
