'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { type Doc } from '@convex/_generated/dataModel';

type DirectRentalModalProps = {
  rentalPost: Doc<'rentalposts'>;
};

export function DirectRentalModal({ rentalPost }: DirectRentalModalProps) {
  const [rentalDays, setRentalDays] = useState([7]);

  const totalRentalCost = rentalPost.hourlyRate * rentalDays[0];
  const collateralCost = rentalPost.collateral;
  const platformFee = totalRentalCost * 0.025; // 2.5% platform fee
  const totalCost = totalRentalCost + collateralCost + platformFee;

  return (
    <DialogContent className='bg-slate-900 border-slate-800 text-white max-w-md'>
      <DialogHeader>
        <DialogTitle className='text-xl'>Rent {rentalPost.name}</DialogTitle>
      </DialogHeader>

      <div className='space-y-6'>
        <div>
          <Label className='text-slate-300'>Rental Duration: {rentalDays[0]} day(s)</Label>
          <Slider
            value={rentalDays}
            onValueChange={setRentalDays}
            max={rentalPost.rentalDuration}
            min={1}
            step={1}
            className='mt-2'
          />
        </div>

        <div className='bg-slate-800 rounded-lg p-4 space-y-3'>
          <div className='flex justify-between'>
            <span className='text-slate-400'>Rental ({rentalDays[0]} days)</span>
            <span className='text-white'>{totalRentalCost.toFixed(4)} ETH</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-slate-400'>Collateral (refundable)</span>
            <span className='text-cyan-400'>{collateralCost.toFixed(4)} ETH</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-slate-400'>Platform Fee (2.5%)</span>
            <span className='text-slate-400'>{platformFee.toFixed(4)} ETH</span>
          </div>
          <Separator className='bg-slate-700' />
          <div className='flex justify-between font-semibold'>
            <span className='text-white'>Total</span>
            <span className='text-purple-400'>{totalCost.toFixed(4)} ETH</span>
          </div>
        </div>

        <div className='text-xs text-slate-400 space-y-1'>
          <p>• NFT will be held in escrow during rental period</p>
          <p>• Collateral will be returned when NFT is returned on time</p>
          <p>• Late returns forfeit collateral to the owner</p>
        </div>

        <Link href={`#`}>
          <Button className='w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0'>
            Proceed to Escrow
          </Button>
        </Link>
      </div>
    </DialogContent>
  );
}
