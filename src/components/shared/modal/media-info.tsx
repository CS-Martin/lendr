import { Button } from '@/components/ui/button';
import { formatFileSize, truncateText } from '@/lib/utils';
import { ExternalLink, ImageIcon } from 'lucide-react';
import { NftMetadata } from 'alchemy-sdk';

export const MediaInfo = ({ nft }: { nft: NftMetadata }) => (
  <div className='bg-gray-800/30 rounded-lg p-4 border border-gray-700/50'>
    <div className='flex items-center gap-2 mb-3'>
      <ImageIcon className='h-4 w-4 text-lendr-400' />
      <span className='font-medium text-white'>Media Information</span>
    </div>
    <div className='grid grid-cols-2 gap-4 text-sm'>
      <div>
        <span className='text-gray-400'>Type:</span>
        <span className='ml-2 text-white'>{nft.image?.contentType || 'Unknown'}</span>
      </div>
      <div>
        <span className='text-gray-400'>Size:</span>
        <span className='ml-2 text-white'>{formatFileSize(nft.image?.size)}</span>
      </div>
      <div>
        <span className='text-gray-400'>Original URL:</span>
        <div className='flex items-center gap-1 mt-1'>
          <code className='text-xs text-gray-300 truncate'>{truncateText(nft.image?.originalUrl || '', 30, 10)}</code>
          {nft.image?.originalUrl && (
            <Button
              size='sm'
              variant='ghost'
              className='h-6 w-6 p-0 text-gray-400 hover:text-white'
              onClick={() => window.open(nft.image?.originalUrl, '_blank')}>
              <ExternalLink className='h-3 w-3' />
            </Button>
          )}
        </div>
      </div>
    </div>
  </div>
);
