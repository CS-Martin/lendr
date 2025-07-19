'use client';

import { Grid3X3, List } from 'lucide-react';
import { motion } from 'framer-motion';

interface ViewModeToggleProps {
    viewMode: 'grid' | 'list';
    setViewMode: (mode: 'grid' | 'list') => void;
}

export function ViewModeToggle({ viewMode, setViewMode }: ViewModeToggleProps) {
    return (
        <div className='flex items-center space-x-2'>
            <motion.button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                        ? 'bg-lendr-400 text-black'
                        : 'text-gray-400 hover:text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                <Grid3X3 className='w-5 h-5' />
            </motion.button>
            <motion.button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                        ? 'bg-lendr-400 text-black'
                        : 'text-gray-400 hover:text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                <List className='w-5 h-5' />
            </motion.button>
        </div>
    );
}
