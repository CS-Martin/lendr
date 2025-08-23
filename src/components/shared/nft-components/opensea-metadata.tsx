import { formatDate } from '@/lib/utils';
import { NftRawMetadata } from 'alchemy-sdk';
import { ImageIcon } from 'lucide-react';

export const OpenSeaMetadata = ({ nftMetadata }: { nftMetadata: NftRawMetadata }) => (
  <div className='bg-gray-800/30 rounded-lg p-4 border border-gray-700/50'>
    <div className='flex items-center gap-2 mb-3'>
      <ImageIcon className='h-4 w-4 text-purple-400' />
      <span className='font-medium text-white'>OpenSea Metadata</span>
    </div>
    <div className='space-y-2 text-sm'>
      <div>
        <span className='text-gray-400'>Collection:</span>
        <span className='ml-2 text-white'>{nftMetadata.metadata.collectionName}</span>
      </div>
      <div>
        <span className='text-gray-400'>Slug:</span>
        <span className='ml-2 text-white'>{nftMetadata.metadata.collectionSlug}</span>
      </div>
      {nftMetadata.metadata.description && (
        <div>
          <span className='text-gray-400'>Description:</span>
          <p className='text-gray-300 mt-1'>{nftMetadata.metadata.description}</p>
        </div>
      )}
      {nftMetadata.metadata.lastIngestedAt && (
        <div>
          <span className='text-gray-400'>Last Updated:</span>
          <span className='ml-2 text-white'>{formatDate(nftMetadata.metadata.lastIngestedAt)}</span>
        </div>
      )}
    </div>
  </div>
);
