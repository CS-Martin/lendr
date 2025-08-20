import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { NftMetadata } from 'alchemy-sdk';

export const SpamWarning = ({ nftMetadata }: { nftMetadata: NftMetadata }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.15 }}
    className='mb-6 bg-red-900/30 border border-red-700/50 rounded-lg p-3 flex items-start gap-2'>
    <AlertTriangle className='h-4 w-4 text-red-400 mt-0.5 flex-shrink-0' />
    <div>
      <h4 className='font-medium text-red-300'>Potential Spam NFT</h4>
      <p className='text-red-400 text-sm mt-1'>
        This NFT has been flagged as potential spam. Be cautious when interacting with it.
      </p>
      {nftMetadata.contract.spamClassifications?.length > 0 && (
        <div className='mt-2'>
          <span className='text-xs text-red-400'>Classifications:</span>
          <div className='flex flex-wrap gap-1 mt-1'>
            {nftMetadata.contract.spamClassifications.map((classification: string, index: number) => (
              <Badge
                key={index}
                variant='outline'
                className='border-red-700/50 text-red-400 text-xs'>
                {classification}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  </motion.div>
);
