'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    onClearFilters?: () => void;
    className?: string;
    title?: string;
    description?: string;
}

export const EmptyState = ({ onClearFilters, className, title, description }: EmptyStateProps) => {
    return (
        <motion.div
            className={cn('text-center py-12', className)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}>
            <motion.div
                className='text-6xl mb-4'
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}>
                🔍
            </motion.div>
            <div className='text-slate-400 text-lg mb-4'>{title}</div>
            {onClearFilters && (
                <>
                    <div className='text-slate-400 text-lg mb-4'>{description}</div>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}>
                        <Button
                            onClick={onClearFilters}
                            variant='outline'
                            className='border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-lendr-400 hover:text-lendr-400 transition-all duration-300 bg-transparent'>
                            Clear All Filters
                        </Button>
                    </motion.div>
                </>
            )}
        </motion.div>
    );
}
