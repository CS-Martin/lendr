import { Footer } from '@/components/shared/footer';
import NavBar from '@/components/shared/navbar';
import { ReactNode } from 'react';

interface HomeLayoutProps {
  children: ReactNode;
}

export default function HomeLayout({ children }: HomeLayoutProps) {
  return (
    <div className='flex flex-col min-h-screen'>
      <NavBar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
