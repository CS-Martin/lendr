import { Footer } from '@/components/shared/footer';
import NavBar from '@/components/shared/navbar';
import { ReactNode } from 'react';

interface ServicesLayoutProps {
    children: ReactNode;
}

export default function ServicesLayout({ children }: ServicesLayoutProps) {
    return (
        <div className='flex flex-col min-h-screen'>
            <NavBar />
            <main>
                {children}
            </main>
            <Footer />
        </div>
    );
}
