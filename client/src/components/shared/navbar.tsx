'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { cn } from '@/lib/utils';

export default function NavBar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 z-50 w-full px-2 md:px-0 flex flex-row items-center justify-between transition-all duration-500',
        isScrolled ? 'h-16 !bg-black/50 border-b' : 'h-15 md:h-28',
        pathname === '/' ? '' : '!h-20 border-b'
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between transition-all duration-500 w-full mx-auto',
          pathname === '/' ? 'max-w-7xl' : 'max-w-[90rem]'
        )}
      >
        <div>test</div>

        <div>
          <ConnectButton
            accountStatus={'full'}
            chainStatus={'full'}
            showBalance={{
              smallScreen: false,
              largeScreen: true,
            }}
          />
        </div>
      </div>
    </nav>
  );
}