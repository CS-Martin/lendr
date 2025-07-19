'use client';

import type React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { SessionProvider } from 'next-auth/react';
import { RainbowKitSiweNextAuthProvider } from '@rainbow-me/rainbowkit-siwe-next-auth';
import { getWagmiConfig } from '@/lib/wagmi';

const queryClient = new QueryClient();
const config = getWagmiConfig();

export function CustomWagmiProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <WagmiProvider config={config}>
            <SessionProvider refetchInterval={0}>
                <QueryClientProvider client={queryClient}>
                    <RainbowKitSiweNextAuthProvider>
                        <RainbowKitProvider
                            theme={lightTheme({
                                accentColor: '#7b3fe4',
                                accentColorForeground: 'white',
                                borderRadius: 'medium',
                                fontStack: 'system',
                                overlayBlur: 'small',
                            })}>
                            {children}
                        </RainbowKitProvider>
                    </RainbowKitSiweNextAuthProvider>
                </QueryClientProvider>
            </SessionProvider>
        </WagmiProvider>
    );
}
