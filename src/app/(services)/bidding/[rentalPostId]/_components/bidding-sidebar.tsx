'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Doc } from '../../../../../../convex/_generated/dataModel';
import { ImageSection } from '@/components/shared/nft-components/image-section';
import { BiddingSection } from '@/components/shared/nft-components/bidding-section';

const BiddingSidebar = ({ post }: { post?: Doc<'rentalposts'> }) => {

  if (!post) return null;

  return (
    <Card className='bg-slate-900 border-gray-700 text-white rounded-lg'>
      <CardContent className='p-4 space-y-4'>
        <ImageSection nftMetadata={post.nftMetadata} />
        <BiddingSection rentalPost={post} />
        <h3 className='text-xl font-bold mt-4'>{post?.name}</h3>
        <Badge className='mt-2 bg-purple-600'>{post?.category}</Badge>
        <div className='mt-6'>
          <h4 className='text-lg font-bold'>Bidding Stats</h4>
          <div className='flex justify-between mt-2'>
            <p className='text-gray-400'>Total Bids</p>
            <p className='font-bold'>12</p>
          </div>
          <div className='flex justify-between mt-2'>
            <p className='text-gray-400'>Highest Bid</p>
            <p className='font-bold text-green-400'>{post?.collateral} ETH</p>
          </div>
          <div className='flex justify-between mt-2'>
            <p className='text-gray-400'>Starting Price</p>
            <p className='font-bold'>{post?.hourlyRate} ETH</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BiddingSidebar;
