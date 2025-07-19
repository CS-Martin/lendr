'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AnimatePresence, motion } from 'framer-motion';

interface SearchBarProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

export function SearchBar({ searchTerm, setSearchTerm }: SearchBarProps) {
    return (
        <div className='relative max-w-md flex-1'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5' />
            <Input
                placeholder='Search NFTs...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10 bg-slate-900/50 border-slate-700 text-white placeholder-slate-400 focus:border-lendr-400 transition-colors'
            />
            <AnimatePresence>
                {searchTerm && (
                    <motion.button
                        onClick={() => setSearchTerm('')}
                        className='absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white'
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}>
                        <X className='w-4 h-4' />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
