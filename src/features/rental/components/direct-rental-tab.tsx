'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { type Doc } from '@convex/_generated/dataModel';
import { DirectRentalModal } from './direct-rental-modal';

type DirectRentalTabProps = {
  rentalPost: Doc<'rentalposts'>;
};

function DirectRentalPrice({ rentalPost }: DirectRentalTabProps) {
  return (
    <Card className='bg-slate-900/50 border-slate-800'>
      <CardContent className='p-6'>
        <div className='grid grid-cols-2 gap-6'>
          <div>
            <div className='text-slate-400 text-sm mb-1'>Fixed Price</div>
            <div className='text-3xl font-bold text-purple-400'>{rentalPost.hourlyRate} ETH</div>
            <div className='text-slate-400 text-sm'>per day</div>
          </div>
          <div>
            <div className='text-slate-400 text-sm mb-1'>Collateral Required</div>
            <div className='text-3xl font-bold text-cyan-400'>{rentalPost.collateral} ETH</div>
            <div className='text-slate-400 text-sm'>refundable</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RentalTerms({ rentalPost }: DirectRentalTabProps) {
  return (
    <Card className='bg-slate-900/50 border-slate-800'>
      <CardHeader>
        <CardTitle className='text-white flex items-center space-x-2'>
          <Clock className='w-5 h-5' />
          <span>Rental Terms</span>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-2 gap-4 text-sm'>
          <div>
            <div className='text-slate-400'>Min Duration</div>
            <div className='text-white'>1 day(s)</div>
          </div>
          <div>
            <div className='text-slate-400'>Max Duration</div>
            <div className='text-white'>{rentalPost.rentalDuration} day(s)</div>
          </div>
        </div>
        <div className='flex items-center space-x-2 text-sm'>
          <Shield className='w-4 h-4 text-cyan-400' />
          <span className='text-slate-300'>Protected by smart contract escrow</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function DirectRentalTab({ rentalPost }: DirectRentalTabProps) {
  const [showRentalModal, setShowRentalModal] = useState(false);

  return (
    <div className='space-y-6'>
      <DirectRentalPrice rentalPost={rentalPost} />
      <RentalTerms rentalPost={rentalPost} />
      <Dialog
        open={showRentalModal}
        onOpenChange={setShowRentalModal}>
        <DialogTrigger asChild>
          <Button
            size='lg'
            className='w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0 py-4 text-lg'
            disabled={rentalPost.status !== 'AVAILABLE'}>
            {rentalPost.status === 'AVAILABLE' ? `Rent Directly ${rentalPost.isBiddable ? '(Skip Bidding)' : ''}` : 'Currently Rented'}
          </Button>
        </DialogTrigger>
        <DirectRentalModal rentalPost={rentalPost} />
      </Dialog>
    </div>
  );
}
