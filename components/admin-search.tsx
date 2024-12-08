'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const formSchema = z.object({
  search: z.string()
});

export default function AdminSearch() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: ''
    }
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {};

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="relative ">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search products..."
          className="w-full appearance-none bg-background pl-8 shadow-none"
          {...form.register('search')}
        />
      </div>
    </form>
  );
}
