'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, MessageCircle, Zap, Home, BarChart3, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useChatSheetStore } from '@/stores/chat-sheet.store';

export function MobileSidebar() {
    const pathname = usePathname();
    const { openChatSheet } = useChatSheetStore();

    const navigationItems = [
        {
            href: '/',
            label: 'Home',
            icon: Home,
        },
        {
            href: '/marketplace',
            label: 'Marketplace',
            icon: ShoppingCart,
        },
        {
            href: '/dashboard',
            label: 'Dashboard',
            icon: BarChart3,
        },
    ];

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden text-white hover:text-lendr-400 hover:bg-slate-800">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-70 bg-slate-900 border-r border-slate-800 p-0">
                <SheetHeader className='border-b border-slate-800'>
                    <SheetTitle className='sr-only'>Lendr</SheetTitle>
                    {/* Header */}
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-lendr-400 to-lendr-500 rounded-lg flex items-center justify-center">
                            <Zap className="w-5 h-5 text-slate-950" />
                        </div>
                        <span className="text-xl font-bold text-lendr-400">Lendr</span>
                    </div>
                </SheetHeader>
                <div className="flex flex-col h-full">

                    {/* Navigation */}
                    <nav className="flex-1 p-2 space-y-2">
                        {navigationItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center space-x-3 p-3 rounded-lg transition-colors duration-300',
                                        isActive
                                            ? 'bg-lendr-400/10 text-lendr-400 border border-lendr-400/20'
                                            : 'text-gray-300 hover:text-white hover:bg-slate-800'
                                    )}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="">{item.label}</span>
                                </Link>
                            );
                        })}

                        {/* Messages Button */}
                        <button
                            onClick={() => {
                                openChatSheet();
                                document.querySelector('[data-state="open"]')?.dispatchEvent(new Event('close'));
                            }}
                            className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:text-white hover:bg-slate-800 w-full transition-colors duration-200"
                        >
                            <MessageCircle className="w-5 h-5" />
                            <span className="font-medium">Messages</span>
                        </button>
                    </nav>

                    {/* Footer */}
                    <div className="p-6 border-t border-slate-800">
                        <div className="text-xs text-gray-400">
                            <p>© 2024 Lendr</p>
                            <p className="mt-1">Peer-to-peer lending platform</p>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}