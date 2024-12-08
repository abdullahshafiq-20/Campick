'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
  id: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  includeHome?: boolean;
}

export function Breadcrumbs({
  items = [],
  includeHome = true
}: BreadcrumbsProps) {
  const pathname = usePathname();

  const defaultItems: BreadcrumbItem[] = [
    ...(includeHome ? [{ label: 'Home', href: '/', id: 'default-home' }] : []),
    ...items.map((item) => ({
      ...item,
      href: item.href || '#'
    }))
  ];

  return (
    <nav className="py-4">
      <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
        {defaultItems.map((item, index) => (
          <li key={item.id} className="flex items-center">
            {index > 0 && <ChevronRight className="mx-2 h-4 w-4" />}
            {index === defaultItems.length - 1 ? (
              <span className="text-primary">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className="transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
