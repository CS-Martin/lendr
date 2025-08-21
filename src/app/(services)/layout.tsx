import { Footer } from '@/components/shared/footer';
import MainNavbar from '@/components/shared/main-navbar';
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
