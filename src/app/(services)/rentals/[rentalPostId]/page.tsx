'use client';

import { useQuery } from 'convex/react';
import { useParams } from 'next/navigation';
import { api } from '../../../../../convex/_generated/api';
import { type Id } from '../../../../../convex/_generated/dataModel';
import { NftImageColumn } from './_components/nft-image-column';
import { RentalInfoColumn } from './_components/rental-info-column';

export default function RentalPostDetailPage() {
  const { rentalPostId } = useParams<{ rentalPostId: string }>();

  const rentalPost = useQuery(api.rentalpost.getOneRentalPost, {
    id: rentalPostId as Id<'rentalposts'>,
  });

  if (!rentalPost) {
    return null;
  }

  return (
    <div className='min-h-screen bg-slate-950 overflow-hidden'>
      <div className='flex my-25'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 container max-w-7xl px-4 mx-auto'>
          <NftImageColumn rentalPost={rentalPost} />
          <RentalInfoColumn rentalPost={rentalPost} />
        </div>
      </div>
    </div>
  );
}
