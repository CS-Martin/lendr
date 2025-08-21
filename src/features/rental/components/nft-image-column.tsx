'use client';

import { BiddingSection } from '@/components/shared/nft-components/bidding-section';
import { ContractInfo } from '@/components/shared/nft-components/contract-info';
import { ImageSection } from '@/components/shared/nft-components/image-section';
import { TimelineInfo } from '@/components/shared/nft-components/timeline-info';
import { TokenDetails } from '@/components/shared/nft-components/token-details';
import { Separator } from '@/components/ui/separator';
import { type Doc } from '@convex/_generated/dataModel';

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
