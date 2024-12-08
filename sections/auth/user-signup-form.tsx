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
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SIGNUP_URL = `${API_URL}/api/shop_signup`;

const formSchema = z.object({
  fullname: z
    .string()
    .min(2, { message: 'Full name must be at least 2 characters long' }),
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' })
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserSignupForm() {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema)
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: UserFormValue) => {
    setLoading(true);
    try {
      const response = await axios.post(SIGNUP_URL, {
        user_name: data.fullname,
        email: data.email,
        password: data.password
      });

      toast({
        description: 'Signup successful',
        style: { backgroundColor: 'rgba(34, 139, 34, 0.8)', color: 'white' }
      });
      router.push('/signin');
    } catch (error: AxiosError | any) {
      const errorMessage =
        error.response?.data?.message || 'Signup failed. Please try again.';
      toast({
        description: errorMessage,
        style: { backgroundColor: 'rgba(139, 0, 0, 0.8)', color: 'white' }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    router.push('/signin');
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-2"
        >
          <FormField
            control={form.control}
            name="fullname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter your full name..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
            {loading ? 'Loading...' : 'Sign Up'}
          </Button>
        </form>
      </Form>

      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-2 text-muted-foreground">
          Already signed up?{' '}
          <a
            onClick={handleLoginRedirect}
            className="text-primary"
            style={{ cursor: 'pointer' }}
          >
            Sign in
          </a>
        </span>
      </div>
    </>
  );
}
