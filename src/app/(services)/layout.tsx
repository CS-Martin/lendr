import { Footer } from '@/components/shared/layout/footer';
import MainNavbar from '@/components/shared/layout/main-navbar';
import { EscrowLifecycleProvider } from '@/features/escrow/providers/escrow-provider';
import { ReactNode } from 'react';

interface ServicesLayoutProps {
  children: ReactNode;
}

export default function ServicesLayout({ children }: ServicesLayoutProps) {
  return (
    <EscrowLifecycleProvider>
      <div className='flex flex-col min-h-screen'>
        <MainNavbar />

        <main>{children}</main>

        <Footer />
      </div>
    </EscrowLifecycleProvider>
  );
}
