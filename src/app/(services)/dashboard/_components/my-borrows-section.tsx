'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import NftCard from './nft-card';

const MyBorrowsSection = () => {
  const { data: session } = useSession();
  const address = session?.user?.address || '';
  const borrowedNfts = useQuery(api.rentalpost.getBorrowedRentalPosts, { renterAddress: address });

  return (
    <div>
      <h2 className='text-2xl font-bold text-white mb-4'>My Borrows</h2>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
        {borrowedNfts?.map((nft) => (
          <NftCard
            key={nft._id}
            post={nft}
            viewMode='borrower'
          />
        ))}
      </div>
    </div>
  );
};

export default MyBorrowsSection;
