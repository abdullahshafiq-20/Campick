'use client';

import { DashboardNav } from '@/components/dashboard-nav';
import { navItems } from '@/constants/data';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import Logo from '@/public/campick-new-logo.svg';
import Image from 'next/image';
import { useState } from 'react';
import { X } from 'lucide-react';

interface SidebarProps {
  onClose: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  const handleToggle = () => {
    setIsMinimized((prev) => !prev);
  };

  return (
    <div className="h-full w-full max-w-[280px] border-r bg-background">
      {/* Close button - only visible on mobile */}
      <div className="flex items-center justify-between p-4 lg:hidden">
        <div className="w-32 sm:w-40">
          <Image
            src={Logo}
            alt="Logo"
            className="h-auto w-full object-contain"
          />
        </div>
        <button onClick={onClose} className="rounded-md p-2 hover:bg-accent">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Logo - hidden on mobile */}
      <div className="hidden p-4 lg:block">
        <div className="w-40">
          <Image
            src={Logo}
            alt="Logo"
            className="h-auto w-full object-contain"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 overflow-y-auto px-3">
        <div className="px-3 py-2">
          <div className="mt-3 space-y-1">
            <DashboardNav items={navItems} />
          </div>
        </div>
      </nav>
    </div>
  );
}
