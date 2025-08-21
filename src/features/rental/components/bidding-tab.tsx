'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Clock, User, Award, ChevronDown } from 'lucide-react';
import { type Doc } from '@convex/_generated/dataModel';
import { BiddingForm } from './bidding-form';
import { usePaginatedQuery } from 'convex/react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { api } from '@convex/_generated/api';
import { formatDuration } from '@/lib/utils';
import { useMemo } from 'react';

type BiddingTabProps = {
  rentalPost: Doc<'rentalposts'>;
};

function BiddingStatus({ rentalPost, bids }: { rentalPost: Doc<'rentalposts'>; bids: any[] }) {
  // Calculate highest total value instead of highest hourly rate
  const highestTotalValue =
    bids.length > 0 ? Math.max(...bids.map((bid) => bid.bidAmount * bid.rentalDuration)) : rentalPost.hourlyRate; // Fallback to hourly rate if no bids

  const highestHourlyRate = bids.length > 0 ? Math.max(...bids.map((bid) => bid.bidAmount)) : rentalPost.hourlyRate;

  const totalBids = bids.length;
  const uniqueBidders = new Set(bids.map((bid) => bid.bidderAddress)).size;

  return (
    <Card className='bg-slate-900/50 border-slate-800'>
      <CardContent className='p-6'>
        <div className='grid grid-cols-3 gap-6 text-center'>
          <div>
            <div className='text-slate-400 text-sm mb-1'>Starting Price</div>
            <div className='text-2xl font-bold text-slate-300'>{rentalPost.hourlyRate} ETH</div>
            <div className='text-slate-400 text-sm'>per hour</div>
          </div>
          <div>
            <div className='text-slate-400 text-sm mb-1'>Highest Total</div>
            <div className='text-xl font-bold text-green-400'>{highestTotalValue} ETH</div>
            <div className='text-slate-400 text-sm'>total value</div>
          </div>
          <div>
            <div className='text-slate-400 text-sm mb-1'>Bids / Bidders</div>
            <div className='text-xl font-bold text-orange-400'>{totalBids}</div>
            <div className='text-slate-400 text-sm'>{uniqueBidders} bidders</div>
          </div>
        </div>

        {/* Additional info about highest hourly rate */}
        <div className='mt-4 text-center text-slate-400 text-sm'>Highest hourly rate: {highestHourlyRate} ETH/hr</div>
      </CardContent>
    </Card>
  );
}

function BidItem({ bid, rank, isCurrentUser }: { bid: any; rank: number; isCurrentUser: boolean }) {
  const totalValue = bid.bidAmount * bid.rentalDuration;
  const hourlyRate = bid.bidAmount;

  return (
    <div
      className={`p-4 rounded-lg border ${isCurrentUser ? 'bg-blue-900/20 border-blue-700/50' : 'bg-slate-800/30 border-slate-700/50'
        }`}>
      <div className='flex justify-between items-start mb-2'>
        <div className='flex items-center space-x-2'>
          {/* Ranking badge based on total value */}
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${rank === 1
              ? 'bg-yellow-500 text-black'
              : rank === 2
                ? 'bg-gray-400 text-black'
                : rank === 3
                  ? 'bg-amber-700 text-white'
                  : 'bg-slate-700 text-slate-300'
              }`}>
            #{rank}
          </div>

          <User className='h-4 w-4 text-slate-400' />
          <span className='text-white font-medium'>
            {bid.bidderAddress.slice(0, 8)}...{bid.bidderAddress.slice(-6)}
          </span>
        </div>

        {/* Total Value (Primary ranking metric) */}
        <div className='text-right'>
          <div className='text-lg font-bold text-green-400'>{totalValue} ETH</div>
          <div className='text-sm text-slate-400'>total value</div>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-4 text-sm mt-3'>
        <div>
          <span className='text-slate-400'>Rate: </span>
          <span className='text-amber-400 font-medium'>{hourlyRate} ETH/hr</span>
        </div>
        <div>
          <span className='text-slate-400'>Duration: </span>
          <span className='text-white'>{formatDuration(bid.rentalDuration)}</span>
        </div>
      </div>

      {/* Badges */}
      <div className='flex flex-wrap gap-2 mt-3'>
        {isCurrentUser && (
          <Badge
            variant='outline'
            className='bg-blue-900/30 text-blue-300 border-blue-700 text-xs'>
            Your Bid
          </Badge>
        )}
        {bid.isAccepted && (
          <Badge
            variant='outline'
            className='bg-green-900/30 text-green-300 border-green-700 text-xs'>
            <Award className='h-3 w-3 mr-1' /> Accepted
          </Badge>
        )}
      </div>

      {bid.message && (
        <div className='mt-3 p-3 bg-slate-800/50 rounded-md'>
          <p className='text-slate-300 text-sm italic'>&quot;{bid.message}&quot;</p>
        </div>
      )}

      <div className='flex justify-between items-center mt-3 text-xs text-slate-500'>
        <div className='flex items-center'>
          <Clock className='h-3 w-3 mr-1' />
          {formatDistanceToNow(new Date(bid.updatedTime), { addSuffix: true })}
        </div>
        {bid._updatedTime !== bid._creationTime && <span>Edited</span>}
      </div>
    </div>
  );
}

function CurrentBids({ rentalPost }: { rentalPost: Doc<'rentalposts'> }) {
  const { data: session } = useSession();
  const user = session?.user;

  const {
    results: bids,
    status,
    loadMore,
    isLoading,
  } = usePaginatedQuery(api.bids.getBidsByRentalPost, { rentalPostId: rentalPost._id }, { initialNumItems: 5 });

  // Sort bids by total value (client-side)
  const sortedBids = useMemo(() => {
    return [...bids].sort((a, b) => b.bidAmount * b.rentalDuration - a.bidAmount * a.rentalDuration);
  }, [bids]);

  if (isLoading && bids.length === 0) {
    return (
      <Card className='bg-slate-900/50 border-slate-800'>
        <CardHeader>
          <CardTitle className='text-white flex items-center space-x-2'>
            <TrendingUp className='w-5 h-5 text-green-400' />
            <span>Current Bids (Ranked by Total Value)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className='p-4 rounded-lg bg-slate-800/30 border-slate-700/50'>
              <Skeleton className='h-4 w-1/3 mb-2' />
              <Skeleton className='h-6 w-1/4 mb-3' />
              <div className='grid grid-cols-2 gap-4'>
                <Skeleton className='h-3 w-full' />
                <Skeleton className='h-3 w-full' />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const currentUserAddress = user?.address || '';

  return (
    <Card className='bg-slate-900/50 border-slate-800'>
      <CardHeader>
        <CardTitle className='text-white flex items-center space-x-2'>
          <TrendingUp className='w-5 h-5 text-green-400' />
          <span>Current Bids (Ranked by Total Value)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {sortedBids.length === 0 ? (
          <div className='text-center py-8 text-slate-400'>
            <TrendingUp className='h-12 w-12 mx-auto mb-4 opacity-50' />
            <p>No bids yet. Be the first to place a bid!</p>
          </div>
        ) : (
          <>
            {sortedBids.map((bid, index) => (
              <BidItem
                key={bid._id}
                bid={bid}
                rank={index + 1}
                isCurrentUser={bid.bidderAddress === currentUserAddress}
              />
            ))}

            {status === 'CanLoadMore' && (
              <div className='flex justify-center pt-4'>
                <Button
                  onClick={() => loadMore(5)}
                  disabled={isLoading}
                  variant='outline'
                  className='border-slate-700 text-slate-300 hover:bg-slate-800'>
                  {isLoading ? (
                    'Loading...'
                  ) : (
                    <>
                      <ChevronDown className='h-4 w-4 mr-2' />
                      Load More Bids
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function BiddingTab({ rentalPost }: BiddingTabProps) {
  // For the bidding status, we need all bids to calculate statistics
  const allBids = usePaginatedQuery(
    api.bids.getBidsByRentalPost,
    { rentalPostId: rentalPost._id },
    { initialNumItems: 100 },
  ).results;

  return (
    <div className='space-y-6'>
      <BiddingStatus
        rentalPost={rentalPost}
        bids={allBids}
      />
      <BiddingForm rentalPost={rentalPost} />
      <CurrentBids rentalPost={rentalPost} />
    </div>
  );
}
