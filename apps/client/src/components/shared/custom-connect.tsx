'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';
import { ChevronDown, Wallet, User } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { EthereumIcon } from './icons/lendr.icons';

export const WalletConnectButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { address } = useAccount();

    return (
        <ConnectButton.Custom>
            {({ account, chain, openConnectModal, openAccountModal, mounted }) => {
                const ready = mounted;
                const connected = ready && account && chain;

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
                            <div className='relative'>
                                {/* Display account balance */}
                                <div className='flex flex-row gap-3 text-white'>
                                    {connected && (
                                        <div className='flex items-center gap-2 hover:bg-gray-700/20 rounded-md cursor-pointer px-2'>
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
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        className='flex items-center text-white hover:bg-gray-700/20 rounded-md gap-2 cursor-pointer px-3 py-2 transition-all'
                                        onClick={() => setIsOpen(!isOpen)}>
                                        <div className='flex items-center gap-2'>
                                            <div className='w-2 h-2 rounded-full bg-green-400' />
                                            <span className='text-sm font-medium'>
                                                {account.address.slice(0, 6) +
                                                    '...' +
                                                    account?.address.slice(-4)}
                                            </span>
                                        </div>
                                        <ChevronDown
                                            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                        />
                                    </motion.button>
                                </div>

                                {isOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className='absolute right-0 mt-2 w-48 bg-gray-900 text-white border border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden'>
                                        <div className='p-1'>
                                            {address && (
                                                <Link
                                                    href={`/${address}`}
                                                    className='flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-700/50 rounded-lg transition-colors'
                                                    onClick={() => setIsOpen(false)}>
                                                    <User className='w-4 h-4' />
                                                    <span>Profile</span>
                                                </Link>
                                            )}
                                            <button
                                                className='w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-700/50 rounded-lg transition-colors'
                                                onClick={() => {
                                                    openAccountModal();
                                                    setIsOpen(false);
                                                }}>
                                                <Wallet className='w-4 h-4' />
                                                <span>Disconnect</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </div>
                );
            }}
        </ConnectButton.Custom>
    );
};
