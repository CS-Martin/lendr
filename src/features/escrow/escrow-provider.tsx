'use client';

import { useState, useEffect } from 'react';
import { EscrowDetails } from './escrow-details';
import { useParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { EscrowLifecycle } from './escrow-lifecycle';

export function EscrowProvider() {
  const { rentalPostId } = useParams<{ rentalPostId: string }>();
  const escrowData = useQuery(api.escrowSmartContract.getEscrowSmartContract, {
    rentalPostId: rentalPostId as Id<'rentalposts'>,
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

  // Show loading state while data is being fetched
  if (escrowData === undefined) {
    return <div>Loading escrow data...</div>;
  }

  // Handle case when no escrow data is found
  if (escrowData === null) {
    return <div>No escrow data found for this rental.</div>;
  }

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
      <EscrowDetails escrowData={escrowData} />
      {/* <EscrowLifecycle escrowData={escrowData} timeRemaining={timeRemaining} /> */}
    </div>
  );
}
