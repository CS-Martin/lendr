import { DetailSection } from './detail-section';
import { Hash } from 'lucide-react';
import { motion } from 'framer-motion';

export const AttributesSection = ({ attributes }: { attributes: any[] }) => (
  <div>
    <DetailSection
      title='Attributes'
      icon={Hash}
      iconColor='text-pink-400'>
      <div className='grid grid-cols-2 gap-3 mt-4'>
        {attributes.map((attr: any, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className='bg-gray-800/30 rounded-lg p-3 border border-gray-700/50'>
            <div className='text-xs text-gray-400 uppercase tracking-wider mb-1'>{attr.trait_type}</div>
            <div className='text-white font-medium'>{attr.value}</div>
          </motion.div>
        ))}
      </div>
    </DetailSection>
  </div>
);
