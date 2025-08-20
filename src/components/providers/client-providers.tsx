'use client';

import dynamic from 'next/dynamic';
import { LoadingProgressProvider } from '@/providers/bprogress';
import { Toaster } from 'sonner';
import { QueryProvider } from '@/providers/query-provider';

const WagmiProvider = dynamic(() => import('../../providers/wagmi').then((mod) => mod.CustomWagmiProvider), {
  ssr: false,
});

interface ClientProvidersProps {
  children: React.ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <WagmiProvider>
      <QueryProvider>
        <LoadingProgressProvider>
          {children}
          <Toaster
            position='top-right'
            richColors
          />
        </LoadingProgressProvider>
      </QueryProvider>
    </WagmiProvider>
  );
}
