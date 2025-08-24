'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { HolographicText } from '@/components/shared/holographic-text';
import { MessageCircle, Zap } from 'lucide-react';
import Link from 'next/link';
import { ChatSheet } from '@/features/chat/components/chat-sheet';
import { WalletConnectButton } from '../wallet-connect-btn';
import LendrButton from '../lendr-btn';
import { useChatSheetStore } from '@/stores/chat-sheet.store';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { MobileSidebar } from './mobile-sidebar';
import { usePathname } from 'next/navigation';

export default function NavBar() {
  const pathname = usePathname();
  const { openChatSheet } = useChatSheetStore();
  const { address } = useAccount();
  const heartbeat = useMutation(api.presence.heartbeat);

  useEffect(() => {
    if (!address) return;

    const interval = setInterval(() => {
      heartbeat({ address });
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [address, heartbeat]);

  return (
    <nav
      className={cn(
        'sticky top-0 z-50 w-full px-2 md:px-0 flex flex-row items-center justify-between transition-all duration-500 h-20 border-b border-slate-800 bg-slate-950',
      )}>
      <div className={cn('flex items-center justify-between py-2.5 transition-all duration-500 w-full mx-auto px-2', pathname === '/marketplace' ? 'w-full' : 'max-w-7xl')}>
        {/* Mobile Sidebar Trigger */}
        <div className="lg:hidden border rounded-md border-slate-800">
          <MobileSidebar />
        </div>

        {/* Logo */}
        <Link href={'/'} className="lg:static lg:left-0 lg:translate-x-0 absolute left-1/2 -translate-x-1/2 flex items-center space-x-2">
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
            <HolographicText className='text-xl hidden md:flex font-bold text-lendr-400'>Lendr</HolographicText>
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <div className='absolute left-1/2 transform -translate-x-1/2 space-x-5 hidden lg:flex'>
          <Link
            href={'/marketplace'}
            className={cn(
              'transition-colors duration-300',
              pathname === '/marketplace'
                ? 'text-lendr-400 font-medium'
                : 'text-white hover:text-lendr-400'
            )}>
            Marketplace
          </Link>
          <Link
            href={'/dashboard'}
            className={cn(
              'transition-colors duration-300',
              pathname.startsWith('/dashboard')
                ? 'text-lendr-400 font-medium'
                : 'text-white hover:text-lendr-400'
            )}>
            Dashboard
          </Link>
        </div>

        {/* Desktop Actions */}
        <div className='relative z-50 flex items-center gap-2 md:gap-4'>
          <LendrButton
            variant={'ghost'}
            onClick={() => openChatSheet()}
            className='text-white hidden md:block rounded-md hover:text-lendr-400 hover:bg-slate-800 transition-colors duration-300 border border-slate-800'>
            <MessageCircle className='w-5 h-5 lg:mr-2 text-slate-400' />
            <p className='text-slate-400 font-normal hidden lg:block'>Messages</p>
          </LendrButton>
          <WalletConnectButton />
        </div>

        <ChatSheet />
      </div>
    </nav>
  );
}