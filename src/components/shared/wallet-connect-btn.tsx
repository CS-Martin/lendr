'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';
import { ChevronDown, Wallet, User, Settings, Globe2 } from 'lucide-react';
import Link from 'next/link';
import { EthereumIcon } from './icons/lendr.icons';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useRef } from 'react';

export const WalletConnectButton = () => {
  const prevState = useRef<{
    connected: boolean | undefined;
    unsupportedChain: boolean | undefined;
    ready: boolean;
  } | null>(null);

  const hasShownInitialToasts = useRef(false);

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, openAccountModal, openChainModal, mounted, authenticationStatus }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated');
        const unsupportedChain = connected && chain.unsupported;

        // Only show toasts on actual state changes, not on every render
        if (prevState.current) {
          if (unsupportedChain && !prevState.current.unsupportedChain) {
            toast.error('Unsupported Chain', {
              description: 'Please switch to a supported chain.',
            });
          } else if (ready && !prevState.current.ready && !hasShownInitialToasts.current) {
            toast.success('Your wallet is ready', {
              description: 'Sign message to connect.',
            });
            hasShownInitialToasts.current = true;
          } else if (connected && !prevState.current.connected && !hasShownInitialToasts.current) {
            toast.success('Connected', {
              description: 'You are now connected to a wallet.',
            });
            hasShownInitialToasts.current = true;
          }
        }

        prevState.current = { connected, unsupportedChain, ready };

        return (
          <div className='relative'>
            {!connected ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='flex items-center text-sm space-x-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-lendr-400 to-lendr-500 hover:from-lendr-500 hover:to-lendr-600 text-slate-950 shadow-xl shadow-lendr-400/40'
                onClick={openConnectModal}>
                <Wallet className='w-4 h-4 mr-2' />
                <span>Connect Wallet</span>
              </motion.button>
            ) : (
              <div className='flex flex-row gap-3 text-white'>
                {/* Balance display */}
                {account.displayBalance && (
                  <div className='hidden md:flex items-center gap-2 hover:bg-gray-700/20 rounded-md cursor-pointer px-2'>
                    <span className='text-sm font-medium flex items-center gap-2'>
                      <EthereumIcon
                        width={20}
                        height={20}
                        color='white'
                      />
                      {account.displayBalance}
                    </span>
                  </div>
                )}

                {/* Chain switcher (always available) */}
                <button
                  type='button'
                  onClick={openChainModal}
                  className='hidden md:flex items-center gap-2 hover:bg-gray-700/20 rounded-md cursor-pointer px-2 py-2'>
                  {chain?.hasIcon && chain?.iconUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={chain?.name ?? 'Chain icon'}
                      src={chain.iconUrl}
                      className='w-4 h-4 rounded-full'
                    />
                  )}
                  <span className='text-sm font-medium'>{chain?.name ?? 'Select Network'}</span>
                </button>

                {/* Dropdown menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      className='flex items-center text-white border rounded-md border-slate-800 md:border-none hover:bg-gray-700/20 gap-2 cursor-pointer px-3 py-2 transition-all'
                      onClick={() => unsupportedChain && openChainModal()}>
                      <div className='flex items-center gap-2'>
                        <div
                          className={`hidden md:block w-2 h-2 rounded-full ${unsupportedChain ? 'md:bg-red-400' : 'md:bg-green-400'}`}
                        />
                        <Wallet className='block md:hidden w-4.5 h-4.5 text-neutral-300' />
                        <span className='hidden md:block text-sm font-medium'>{account.displayName}</span>
                      </div>
                      {!unsupportedChain && <ChevronDown className='w-4 h-4' />}
                    </motion.button>
                  </DropdownMenuTrigger>

                  {!unsupportedChain && (
                    <DropdownMenuContent
                      side='bottom'
                      align='start'
                      sideOffset={5}
                      alignOffset={20}
                      className='w-56 bg-gray-900/80 border-gray-700 text-white'>
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator className='bg-gray-700' />
                      <DropdownMenuItem
                        className='cursor-pointer focus:text-white focus:bg-white/20'
                        onClick={openChainModal}>
                        <Globe2 className='w-4 h-4 text-white mr-2' />
                        <span>Change network</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className='bg-gray-700' />
                      <DropdownMenuItem className='cursor-pointer focus:text-white focus:bg-white/20'>
                        <Link
                          href={`/${account.address}`}
                          className='flex items-center gap-2 w-full'>
                          <User className='w-4 h-4 text-white' />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className='cursor-pointer focus:text-white focus:bg-white/20'>
                        <Link
                          href='/settings'
                          className='flex items-center gap-2 w-full'>
                          <Settings className='w-4 h-4 text-white' />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className='bg-gray-700' />
                      <DropdownMenuItem
                        className='cursor-pointer focus:text-white focus:bg-white/20'
                        onClick={openAccountModal}>
                        <Wallet className='w-4 h-4 mr-2 text-white' />
                        <span>Disconnect</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  )}
                </DropdownMenu>
              </div>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
