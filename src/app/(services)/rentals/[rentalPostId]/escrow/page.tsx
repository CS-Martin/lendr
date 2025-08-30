'use client';

import { EscrowLifecycleProvider } from '@/features/escrow/contexts/escrow-lifecycle-context';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { EscrowLifecycle } from '@/features/escrow/components/escrow-lifecycle';
import { EscrowDetails } from '@/features/escrow/components/escrow-details';

export default function EscrowPage() {
  const { rentalPostId } = useParams<{ rentalPostId: string }>();

  // Get escrow data
  const escrowData = useQuery(api.escrowSmartContract.getEscrowSmartContract, {
    rentalPostId: rentalPostId as Id<'rentalposts'>,
  });

  // Get rental post
  const rentalPost = useQuery(api.rentalpost.getOneRentalPost, {
    id: escrowData?.rentalPostId as Id<'rentalposts'>,
  });

  // Get bid
  const bid = useQuery(api.bids.getBidById, {
    bidId: escrowData?.bidId as Id<'bids'>,
  });

  console.log(escrowData);

  const [timeRemaining, setTimeRemaining] = useState({
    step2: { days: 0, hours: 0, minutes: 0, seconds: 0 },
    step4: { days: 0, hours: 0, minutes: 0, seconds: 0 },
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();

      // Step 2 countdown (Lender sends NFT)
      const step2Diff = escrowData ? escrowData.step2ExpiresAt - now : 0;

      if (step2Diff > 0) {
        setTimeRemaining((prev) => ({
          ...prev,
          step2: {
            days: Math.floor(step2Diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((step2Diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((step2Diff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((step2Diff % (1000 * 60)) / 1000),
          },
        }));
      }

      // Step 4 countdown (Renter returns NFT)
      const step4Diff = escrowData ? escrowData.step4ExpiresAt - now : 0;
      if (step4Diff > 0) {
        setTimeRemaining((prev) => ({
          ...prev,
          step4: {
            days: Math.floor(step4Diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((step4Diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((step4Diff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((step4Diff % (1000 * 60)) / 1000),
          },
        }));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [escrowData]);

  if (!rentalPost || !escrowData || !bid) {
    return null;
  }
  return (
    <EscrowLifecycleProvider bid={bid} rentalPost={rentalPost} escrowData={escrowData} timeRemaining={timeRemaining}>
      <div className='min-h-screen bg-slate-950'>
        <div className='container max-w-7xl mx-auto px-2 lg:px-0 py-8'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <div className='lg:col-span-2'>
              <EscrowLifecycle />
            </div>
            <div className='lg:col-span-1'>
              <EscrowDetails />
            </div>
          </div>
        </div>
      </div>
    </EscrowLifecycleProvider>
  );
}
