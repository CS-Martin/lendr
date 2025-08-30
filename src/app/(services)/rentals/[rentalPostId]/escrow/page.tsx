'use client';

import { useParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { EscrowLifecycle } from '@/features/escrow/components/escrow-lifecycle';
import { EscrowDetails } from '@/features/escrow/components/escrow-details';
import { EscrowLifecycleProvider, useEscrowLifecycle } from '@/features/escrow/providers/escrow-provider';
import { useEffect } from 'react';

export default function EscrowPage() {
  const { rentalPostId } = useParams<{ rentalPostId: string }>();

  const { setRentalPostId } = useEscrowLifecycle();

  useEffect(() => {
    if (rentalPostId) {
      setRentalPostId(rentalPostId as Id<'rentalposts'>);
    }
  }, [rentalPostId, setRentalPostId]);

  return (
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
  );
}
