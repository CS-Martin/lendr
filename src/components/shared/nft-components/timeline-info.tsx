import { formatDate } from '@/lib/utils';
import { DetailSection } from './detail-section';
import { Clock } from 'lucide-react';
import { Nft } from 'alchemy-sdk';

export const TimelineInfo = ({ nft }: { nft: Nft }) => (
  <div>
    <DetailSection
      title='Timeline'
      icon={Clock}
      iconColor='text-yellow-400'>
      <div className='space-y-3 mt-4'>
        <div className='flex justify-between items-center'>
          <span className='text-gray-400'>Last Updated:</span>
          <span className='text-white'>{formatDate(nft.timeLastUpdated)}</span>
        </div>
        {nft.acquiredAt?.blockTimestamp && (
          <div className='flex justify-between items-center'>
            <span className='text-gray-400'>Acquired:</span>
            <span className='text-white'>{formatDate(nft.acquiredAt.blockTimestamp)}</span>
          </div>
        )}
      </div>
    </DetailSection>
  </div>
);
