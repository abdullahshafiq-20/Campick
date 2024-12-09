import Link from 'next/link';
import Image from 'next/image';
import Logowhite from '@/public/campick-new-logo-white.svg';

export function Footer1() {
  return (
    <footer className="w-full border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="text-sm text-muted-foreground">
            © 2024 Campick Nuces. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Terms of Service
            </a>
            <a
              href="mailto:campicknuces@gmail.com"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
