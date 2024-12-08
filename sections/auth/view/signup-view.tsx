'use client';

import { Metadata } from 'next';
import Link from 'next/link';
import UserSignupForm from '../user-signup-form';
import { buttonVariants } from '@/components/ui/button';
import Image from 'next/image';
import MainLogo from '@/public/campick-new-logo-white.svg';
import MainLogoBlack from '@/public/campick-new-logo.svg';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function SignUpViewPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
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
      <div className="flex min-h-screen items-center py-10 px-6 lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          <div className="lg:hidden rounded-lg border bg-card text-card-foreground shadow-sm p-8 space-y-6">
            <div className="align-items-center flex flex-col justify-center space-y-4 text-center mb-8">
              <div className="relative z-20 mx-auto flex items-center text-lg font-medium">
                <Image
                  onClick={() => router.push('/')}
                  className="hover:cursor-pointer"
                  src={MainLogoBlack}
                  alt="CamPick Logo"
                  width={180}
                  height={110}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-center text-2xl font-semibold tracking-tight">
                Create your account
              </h1>
              <p className="text-center text-sm text-muted-foreground">
                Sign up to start managing your shop
              </p>

              <UserSignupForm />
            </div>
          </div>

          <div className="hidden lg:block space-y-6">
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
    </div>
  );
}
