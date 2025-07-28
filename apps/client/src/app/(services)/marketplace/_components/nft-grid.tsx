'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { RentalPostCard } from '@/components/shared/rental-post/rental-post-card';

interface NFTGridProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  posts: any[];
  viewMode: 'grid' | 'list';
  isInView: boolean;
}

export function NFTGrid({ posts, viewMode, isInView }: NFTGridProps) {
  return (
    <motion.div
      className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5' : 'grid-cols-1 xl:grid-cols-2'}`}
      layout>
      <AnimatePresence mode='popLayout'>
        {posts.map((post, index) => (
          <motion.div
            key={index}
            className='nft-card'
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{
              duration: 0.5,
              delay: isInView ? index * 0.1 : 0,
            }}
            whileHover={{ y: -5 }}>
            <RentalPostCard
              post={post}
              viewMode={viewMode}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
