import { formatDate } from '@/lib/utils';
import { DetailSection } from './detail-section';
import { Clock } from 'lucide-react';

export const TimelineInfo = ({ nftMetadata }: { nftMetadata: any }) => (
  <div>
    <DetailSection
      title='Timeline'
      icon={Clock}
      iconColor='text-yellow-400'>
      <div className='space-y-3 mt-4'>
        <div className='flex justify-between items-center'>
          <span className='text-gray-400'>Last Updated:</span>
          <span className='text-white'>{formatDate(nftMetadata.timeLastUpdated)}</span>
        </div>
        {nftMetadata.acquiredAt?.blockTimestamp && (
          <div className='flex justify-between items-center'>
            <span className='text-gray-400'>Acquired:</span>
            <span className='text-white'>{formatDate(nftMetadata.acquiredAt.blockTimestamp)}</span>
          </div>
        )}
      </div>
    </DetailSection>
  </div>
);
