'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Layers } from 'lucide-react';
import { Doc } from '@convex/_generated/dataModel';

interface NftCardProps {
  post: Doc<'rentalposts'>;
  onManageBids?: (post: Doc<'rentalposts'>) => void;
  viewMode?: 'lender' | 'borrower';
}

const NftCard = ({ post, onManageBids, viewMode = 'lender' }: NftCardProps) => {
  return (
    <Card className='bg-gray-800 border-gray-700 text-white rounded-lg overflow-hidden'>
      <div className='relative'>
        <div className='w-full h-48 bg-gray-700'></div>
        <Badge className='absolute top-2 left-2 bg-purple-600'>{post.category}</Badge>
        {viewMode === 'lender' && post.isBiddable && (
          <Badge className='absolute top-2 right-2 bg-orange-500'>Bidding</Badge>
        )}
        {viewMode === 'lender' && !post.isBiddable && (
          <Badge className='absolute top-2 right-2 bg-green-500'>Available</Badge>
        )}
        {viewMode === 'borrower' && <Badge className='absolute top-2 right-2 bg-blue-500'>Rented</Badge>}
      </div>
      <CardContent className='p-4'>
        <h3 className='text-lg font-bold'>{post.name}</h3>
        {viewMode === 'lender' ? (
          post.isBiddable ? (
            <div className='grid grid-cols-2 gap-4 mt-2'>
              <div>
                <p className='text-sm text-gray-400'>Starting Price</p>
                <p className='font-bold'>{post.hourlyRate} POL</p>
              </div>
              <div>
                <p className='text-sm text-gray-400'>Highest Bid</p>
                <p className='font-bold text-green-400'>{post.collateral} POL</p>
              </div>
            </div>
          ) : (
            <div className='grid grid-cols-2 gap-4 mt-2'>
              <div>
                <p className='text-sm text-gray-400'>Price/Day</p>
                <p className='font-bold'>{post.hourlyRate} POL</p>
              </div>
              <div>
                <p className='text-sm text-gray-400'>Earned</p>
                <p className='font-bold text-green-400'>{post.collateral} POL</p>
              </div>
            </div>
          )
        ) : (
          <div className='grid grid-cols-2 gap-4 mt-2'>
            <div>
              <p className='text-sm text-gray-400'>Price/Day</p>
              <p className='font-bold'>{post.hourlyRate} POL</p>
            </div>
            <div>
              <p className='text-sm text-gray-400'>Rented by</p>
              <p className='font-bold'>{post.renterAddress}</p>
            </div>
          </div>
        )}
        <div className='flex justify-between items-center mt-4 text-sm text-gray-400'>
          {post.isBiddable && viewMode === 'lender' ? <p>12 active bids</p> : <p>45 views</p>}
          <p>Ends: {new Date(post.biddingEndTime || 0).toLocaleDateString()}</p>
        </div>
        {viewMode === 'lender' && (
          <div className='flex gap-2 mt-4'>
            {post.isBiddable ? (
              <Button
                className='w-full bg-orange-500 hover:bg-orange-600'
                onClick={() => onManageBids && onManageBids(post)}>
                <Layers className='w-4 h-4 mr-2' /> Manage Bids
              </Button>
            ) : (
              <Button
                className='w-full'
                variant='outline'>
                <Edit className='w-4 h-4 mr-2' /> Edit
              </Button>
            )}
            <Button
              variant='destructive'
              size='icon'>
              <Trash2 className='w-4 h-4' />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NftCard;
