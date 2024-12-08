import { SignUpViewPage } from '@/sections/auth/view';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CamPick',
  description: 'Sign Up.'
};

export default function Page() {
  return <SignUpViewPage />;
}
