'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';

interface ActiveFiltersProps {
  selectedFilters: string[];
  onClearAll: () => void;
  onRemoveFilter: (filter: string) => void;
}

export function ActiveFilters({ selectedFilters, onClearAll, onRemoveFilter }: ActiveFiltersProps) {
  return (
    <AnimatePresence>
      {selectedFilters.length > 0 && (
        <motion.div
          className='space-y-2'
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-gray-400'>Active Filters</span>
            <Button
              onClick={onClearAll}
              variant='ghost'
              size='sm'
              className='text-xs text-gray-400 hover:text-white h-6 px-2'>
              Clear All
            </Button>
          </div>
          <div className='flex flex-wrap gap-1'>
            {selectedFilters.map((filter) => (
              <motion.div
                key={filter}
                className='filter-badge'
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                whileHover={{ scale: 1.05 }}>
                <Badge
                  variant='secondary'
                  className='bg-lendr-400/20 text-lendr-400 border-lendr-400/30 text-xs cursor-pointer hover:bg-lendr-400/30'
                  onClick={() => onRemoveFilter(filter)}>
                  {filter.replace('-', ' ')}
                  <X className='w-3 h-3 ml-1' />
                </Badge>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
