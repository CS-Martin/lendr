import { ReactNode } from 'react';

interface HomeLayoutProps {
    children: ReactNode;
}

export default function HomeLayout({ children }: HomeLayoutProps) {
    return (
        <div className='flex flex-col min-h-screen'>
            <div className='flex-1 flex flex-col'>{children}</div>
        </div>
    );
}
