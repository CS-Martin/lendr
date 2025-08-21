'use client';

import { motion } from 'framer-motion';
import { type Doc } from '@convex/_generated/dataModel';
import { RentalHeader } from './rental-header';
import { OwnerCard } from './owner-card';
import { RentalActions } from './rental-actions';

type RentalInfoColumnProps = {
  rentalPost: Doc<'rentalposts'>;
};

export function RentalInfoColumn({ rentalPost }: RentalInfoColumnProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className='space-y-6'>
      <RentalHeader rentalPost={rentalPost} />
      <OwnerCard rentalPost={rentalPost} />
      <RentalActions rentalPost={rentalPost} />
    </motion.div>
  );
}
