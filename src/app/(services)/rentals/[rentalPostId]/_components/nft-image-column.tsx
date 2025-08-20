'use client';

import { BiddingSection } from '@/components/shared/modal/bidding-section';
import { ContractInfo } from '@/components/shared/modal/contract-info';
import { ImageSection } from '@/components/shared/modal/image-section';
import { TimelineInfo } from '@/components/shared/modal/timeline-info';
import { TokenDetails } from '@/components/shared/modal/token-details';
import { Separator } from '@/components/ui/separator';
import { type Doc } from '../../../../../../convex/_generated/dataModel';

type NftImageColumnProps = {
  rentalPost: Doc<'rentalposts'>;
};

export function NftImageColumn({ rentalPost }: NftImageColumnProps) {
  return (
    <div className='flex flex-col space-y-4'>
      <ImageSection nftMetadata={rentalPost.nftMetadata} />
      <BiddingSection rentalPost={rentalPost} />
      <Separator className='bg-gray-700/50' />
      <TokenDetails nftMetadata={rentalPost.nftMetadata} />
      <Separator className='bg-gray-700/50' />
      <ContractInfo nftMetadata={rentalPost.nftMetadata} />
      <Separator className='bg-gray-700/50' />
      <TimelineInfo nftMetadata={rentalPost.nftMetadata} />
    </div>
  );
}
