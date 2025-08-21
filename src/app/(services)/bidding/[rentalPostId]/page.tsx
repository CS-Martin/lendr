import { useQuery } from 'convex/react';
import BiddingSidebar from '@/features/bidding/components/bidding-sidebar';
import BidsList from '@/features/bidding/components/bids-list';
import { Id } from '../../../../../convex/_generated/dataModel';
import { api } from '../../../../../convex/_generated/api';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import NotFound from '@/app/not-found';
import { BiddingPageSkeleton } from '@/features/bidding/components/bidding-skeletons';

export default function BiddingPage() {
  const { data: session } = useSession();
  const { rentalPostId } = useParams<{ rentalPostId: string }>();
  const rentalPost = useQuery(api.rentalpost.getOneRentalPost, { id: rentalPostId as Id<'rentalposts'> });

  if (rentalPost === undefined) {
    return <BiddingPageSkeleton />;
  }

  if (rentalPost === null) {
    return <NotFound />;
  }

  const isOwner = session?.user?.address === rentalPost?.posterAddress;

  if (!isOwner) {
    return (
      <div className='min-h-screen bg-slate-950 overflow-hidden'>
        <div className='container max-w-7xl mx-auto py-8 bg-slate-800/50 border-slate-800 mt-10 p-6 rounded-lg'>
          <div className='text-center text-white'>
            <p className='text-lg font-semibold mb-2'>You are not the owner of this rental post</p>
            <p className='text-sm text-slate-400'>Only the owner can manage bids</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-slate-950 overflow-hidden'>
      <div className='container max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 py-8'>
        <div className='col-span-1'>
          <BiddingSidebar post={rentalPost} />
        </div>
        <div className='col-span-2'>
          <BidsList post={rentalPost} />
        </div>
      </div>
    </div>
  );
}
