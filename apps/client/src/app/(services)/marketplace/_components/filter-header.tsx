'use client';

import { SlidersHorizontal, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface FilterHeaderProps {
    onToggleSidebar: () => void;
    isMobile: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function FilterHeader({ onToggleSidebar, isMobile }: FilterHeaderProps) {
    return (
        <div className='flex items-center justify-between'>
            <motion.h2
                className='text-xl font-bold text-white flex items-center space-x-2'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}>
                <SlidersHorizontal className='w-5 h-5 text-lendr-400' />
                <span>Filters</span>
            </motion.h2>
            <motion.button
                onClick={onToggleSidebar}
                className='md:hidden text-gray-400 hover:text-white'
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}>
                <X className='w-5 h-5' />
            </motion.button>
        </div>
    );
}
