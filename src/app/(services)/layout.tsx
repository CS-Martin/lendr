import { Footer } from '@/components/shared/layout/footer';
import MainNavbar from '@/components/shared/layout/main-navbar';
import { ReactNode } from 'react';

interface ServicesLayoutProps {
  children: ReactNode;
}

export default function ServicesLayout({ children }: ServicesLayoutProps) {
  return (
    <div className='flex flex-col min-h-screen'>
      <MainNavbar />

      <main>{children}</main>

      <Footer />
    </div>
  );
}
