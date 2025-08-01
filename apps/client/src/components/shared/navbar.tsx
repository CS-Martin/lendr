'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { HolographicText } from '@/components/shared/holographic-text';
import { Zap } from 'lucide-react';
import { WalletConnectButton } from './custom-connect';
import Link from 'next/link';

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
        isScrolled ? 'h-23' : 'h-15 md:h-28',
        pathname === '/' ? '' : '!h-20 bg-transparent ',
        pathname === '/marketplace' ? 'border-b border-slate-800' : '',
        pathname !== '/' && isScrolled ? 'bg-slate-950 border-b border-slate-800' : '',
      )}>
      <div
        className={cn(
          'flex items-center justify-between p-2.5 transition-all duration-500 w-full mx-auto',
          pathname === '/' ? 'max-w-7xl border border-slate-800' : 'mx-auto border-b border-slate-800',
          pathname === '/marketplace' ? '' : 'max-w-7xl',
          isScrolled && pathname === '/' ? 'rounded-2xl bg-slate bg-slate-950/80' : 'bg-transparent border-none',
        )}>
        <Link href={'/'}>
          <motion.div
            className='flex items-center space-x-2'
            whileHover={{ scale: 1.05 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 10,
            }}>
            <motion.div
              className='w-8 h-8 bg-gradient-to-br from-lendr-400 to-lendr-500 rounded-lg flex items-center justify-center shadow-lg shadow-lendr-400/50'
              animate={{
                rotateY: [0, 360],
                boxShadow: [
                  '0 0 20px rgba(220, 243, 71, 0.5)',
                  '0 0 30px rgba(220, 243, 71, 0.8)',
                  '0 0 20px rgba(220, 243, 71, 0.5)',
                ],
              }}
              transition={{
                rotateY: {
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'linear',
                },
                boxShadow: {
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                },
              }}>
              <Zap className='w-5 h-5 text-slate-950' />
            </motion.div>
            <HolographicText className='text-xl font-bold text-lendr-400'>Lendr</HolographicText>
          </motion.div>
        </Link>

        <div className='relative z-50'>
          <WalletConnectButton />
        </div>
      </div>
    </nav>
  );
}
