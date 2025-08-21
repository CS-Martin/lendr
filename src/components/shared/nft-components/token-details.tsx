import { DetailSection } from './detail-section';
import { Hash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { NftMetadata } from 'alchemy-sdk';

export const TokenDetails = ({ nftMetadata }: { nftMetadata: NftMetadata }) => (
  <div>
    <DetailSection
      title='Token Details'
      icon={Hash}
      iconColor='text-purple-400'>
      <div className='space-y-3 mt-4'>
        <div className='flex justify-between items-center'>
          <span className='text-gray-400'>Token ID:</span>
          <Badge
            variant='outline'
            className='border-gray-600 text-gray-300'>
            #{nftMetadata.tokenId}
          </Badge>
        </div>
        <div className='flex justify-between items-center'>
          <span className='text-gray-400'>Token Type:</span>
          <Badge
            variant='outline'
            className='border-gray-600 text-gray-300'>
            {nftMetadata.tokenType}
          </Badge>
        </div>
        <div className='flex justify-between items-center'>
          <span className='text-gray-400'>Balance:</span>
          <span className='text-white'>{nftMetadata.balance || '1'}</span>
        </div>
      </div>
    </DetailSection>
  </div>
);
