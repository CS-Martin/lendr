// Fetching data state

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface FetchingDataStateProps {
  className?: string;
}

export const FetchingDataState = ({ className }: FetchingDataStateProps) => {
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
      <div className='text-slate-400 text-lg mb-4'>Fetching data, please wait...</div>
    </motion.div>
  );
};
