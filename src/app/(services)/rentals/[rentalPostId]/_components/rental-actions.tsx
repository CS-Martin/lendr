'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gavel } from 'lucide-react';
import { type Doc } from '../../../../../../convex/_generated/dataModel';
import { BiddingTab } from './bidding-tab';
import { DirectRentalTab } from './direct-rental-tab';

type RentalActionsProps = {
  rentalPost: Doc<'rentalposts'>;
};

export function RentalActions({ rentalPost }: RentalActionsProps) {
  if (rentalPost.isBiddable) {
    return (
      <Tabs
        defaultValue='bidding'
        className='space-y-6'>
        <TabsList className='grid w-full grid-cols-2 bg-slate-800'>
          <TabsTrigger
            value='bidding'
            className='data-[state=active]:bg-orange-600'>
            <Gavel className='w-4 h-4 mr-2' />
            Place Bid
          </TabsTrigger>
          <TabsTrigger
            value='direct'
            className='data-[state=active]:bg-purple-600'>
            Direct Rental
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value='bidding'
          className='space-y-6'>
          <BiddingTab rentalPost={rentalPost} />
        </TabsContent>
        <TabsContent
          value='direct'
          className='space-y-6'>
          <DirectRentalTab rentalPost={rentalPost} />
        </TabsContent>
      </Tabs>
    );
  }

  return <DirectRentalTab rentalPost={rentalPost} />;
}
