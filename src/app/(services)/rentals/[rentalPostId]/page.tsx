'use client';

import { useQuery } from 'convex/react';
import { useParams } from 'next/navigation';
import { api } from '../../../../../convex/_generated/api';
import { type Id } from '../../../../../convex/_generated/dataModel';
import { NftImageColumn } from '@/features/rental/components/nft-image-column';
import { RentalInfoColumn } from '@/features/rental/components/rental-info-column';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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
      <div className='container max-w-7xl mx-auto'>
        <Link
          href='/marketplace'
          className='flex items-center text-neutral-400 space-x-2 py-8 hover:text-white transition-colors duration-300'>
          <ArrowLeft className='w-5 h-5' />
          <div>Go back to Marketplace</div>
        </Link>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          <NftImageColumn rentalPost={rentalPost} />
          <RentalInfoColumn rentalPost={rentalPost} />
        </div>
      </div>
    </div>
  );
}
