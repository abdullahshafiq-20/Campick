import { SignInViewPage } from '@/sections/auth/view';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'CamPick',
  description: 'Sign In.'
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SignInViewPage />
    </Suspense>
  );
}
