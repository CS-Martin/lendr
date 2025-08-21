'use client';

import { useQuery } from 'convex/react';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '../../../../../../convex/_generated/api';
import { type Doc, type Id } from '../../../../../../convex/_generated/dataModel';

type OwnerCardProps = {
  rentalPost: Doc<'rentalposts'>;
};

export function OwnerCard({ rentalPost }: OwnerCardProps) {
  const user = useQuery(api.user.getUser, {
    address: rentalPost?.posterAddress as Id<'users'>,
  });

  const analytics = useQuery(api.user.getDashboardAnalytics, { address: rentalPost?.posterAddress as Id<'users'> });

  console.log(analytics);

  return (
    <Card className='bg-slate-900/50 border-slate-800'>
      <CardContent className='p-6'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <div className='text-slate-400 text-sm'>Owned by</div>
            <div className='text-white font-mono'>
              {user?.address.slice(0, 6)}...{user?.address.slice(-4)}
            </div>
          </div>
          <div className='flex items-center space-x-1'>
            <Star className='w-4 h-4 text-yellow-400 fill-current' />
            <span className='text-white font-semibold'>4.8</span>
            <span className='text-slate-400 text-sm'>({analytics?.activeRentalPosts} active rentals)</span>
          </div>
        </div>
        <div className='text-slate-400 text-sm'>Member since {user?._creationTime}</div>
      </CardContent>
    </Card>
  );
}
