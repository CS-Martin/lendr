'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Doc } from '../../../../../../convex/_generated/dataModel';
import { usePaginatedQuery } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import BidCard from './bid-card';

const BidsList = ({ post }: { post: Doc<'rentalposts'> }) => {
  const [filter, setFilter] = useState('all');
  const { results, status, loadMore } = usePaginatedQuery(
    api.bids.getBidsByRentalPost,
    { rentalPostId: post._id },
    { initialNumItems: 5 },
  );

  return (
    <div>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-2xl font-bold text-white'>Manage Bids</h2>
        <div className='flex gap-2'>
          <Button variant='outline'>End Bidding Early</Button>
          {}
          <Button>Auto-Accept Highest</Button>
        </div>
      </div>
      <div className='space-y-4'>
        {results.map((bid, index) => (
          <BidCard
            key={bid._id}
            bid={bid}
            index={index}
          />
        ))}
      </div>

      {/* If no available bids */}
      {results.length === 0 && (
        <div className='flex justify-center mt-4 text-slate-400 bg-slate-800/50 p-4 rounded-lg backdrop-blur-lg border border-slate-800'>
          <p>No bids available</p>
        </div>
      )}
      {status === 'CanLoadMore' && (
        <div className='flex justify-center mt-4'>
          <Button
            variant='outline'
            onClick={() => loadMore(5)}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
};

export default BidsList;
