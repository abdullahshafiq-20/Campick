'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import GoogleSignInButton from './google-auth-button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SIGNIN_URL = `${API_URL}/api/signin`;

const formSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' })
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
  const { toast } = useToast();

  const router = useRouter();
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema)
  });
  const [loading, setLoading] = useState(false);

  const redirectToPage = (role: string) => {
    const roleRoutes: { [key: string]: string } = {
      shop_owner: '/shopdashboard',
      student: '/',
      teacher: '/'
    };
    router.push(roleRoutes[role] || '/');
  };

  const onSubmit = async (data: UserFormValue) => {
    setLoading(true);
    try {
      const response = await axios.post(SIGNIN_URL, data);
      localStorage.setItem('token', response.data.token);
      toast({
        description: 'Login successful. Please wait...',
        style: { backgroundColor: 'rgba(34, 139, 34, 0.8)', color: 'white' }
      });
      redirectToPage(response.data.user_info.role);
    } catch (error: AxiosError | any) {
      if (error.response) {
        toast({
          description: error.response.data.message,
          style: { backgroundColor: 'rgba(220, 0, 0, 0.8)', color: 'white' }
        });
      } else {
        alert('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignupRedirect = () => router.push('/signup');

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-2"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="ml-auto w-full" type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Login'}
          </Button>
        </form>
      </Form>

      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-2 text-muted-foreground">
          If you don't have an account,{' '}
          <a
            onClick={handleSignupRedirect}
            className="text-primary"
            style={{ cursor: 'pointer' }}
          >
            Sign Up
          </a>
        </span>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>

        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <GoogleSignInButton />
    </>
  );
}
