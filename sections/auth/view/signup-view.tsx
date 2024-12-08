'use client';

import { Metadata } from 'next';
import Link from 'next/link';
import UserSignupForm from '../user-signup-form';
import { buttonVariants } from '@/components/ui/button';
import Image from 'next/image'; // Import the Image component
import MainLogo from '@/public/LOGO_1-removebg-preview.png';
import MainLogoBlack from '@/public/black logo.png';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function SignUpViewPage() {
  const router = useRouter();

  return (
    <div className="relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        href="/examples/authentication"
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute right-4 top-4 hidden md:right-8 md:top-8'
        )}
      >
        Signup
      </Link>
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Image
            className="hover:cursor-pointer"
            onClick={() => router.push('/')}
            src={MainLogo}
            alt="CamPick Logo"
            width={200}
            height={150}
          />
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <h2 className="mb-5">"This page is only for shop owners."</h2>
            <p className="text-lg">
              Welcome to CamPick! Sign up to manage your shop, track orders,
              confirm payments, and keep your customers happy with fast,
              seamless service. Stay in control of your business, all from one
              convenient platform.
            </p>
          </blockquote>
        </div>
      </div>
      <div className="flex h-full items-center p-4 lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {/* Logo for mobile/tablet only */}
          <div className="flex flex-col space-y-2 text-center lg:hidden">
            <div className="relative z-20 mx-auto flex items-center text-lg font-medium">
              <Image
                onClick={() => router.push('/')}
                className="hover:cursor-pointer"
                src={MainLogoBlack}
                alt="CamPick Logo"
                width={170}
                height={100}
              />
            </div>
          </div>

          <h1 className="text-center text-2xl font-semibold tracking-tight">
            Create your account
          </h1>
          <p className="text-center text-sm text-muted-foreground">
            Sign up to start managing your shop
          </p>

          <UserSignupForm />
        </div>
      </div>
    </div>
  );
}
