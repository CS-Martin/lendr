'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { Doc } from '../../../../../convex/_generated/dataModel';
import NftCard from './nft-card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { RentalPostCard } from '@/components/shared/rental-post/rental-post-card';
import { NFTCardSkeleton } from '@/components/shared/skeletons/nft-card';

const MyListingsSection = () => {
  const [selectedPost, setSelectedPost] = useState<Doc<'rentalposts'> | null>(null);
  const { data: session } = useSession();
  const address = session?.user?.address || '';
  const ownedPosts = useQuery(api.rentalpost.getOwnedRentalPosts, { ownerAddress: address });

  const handleManageBids = (post: Doc<'rentalposts'>) => {
    setSelectedPost(post);
  };

  const handleCloseModal = () => {
    setSelectedPost(null);
  };

  return (
    <div>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-2xl font-bold text-white'>My Listings</h2>
        <Button>
          <Plus className='w-4 h-4 mr-2' /> Add NFT
        </Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
        {ownedPosts === undefined ? (
          // Skeletons while fetching
          Array.from({ length: 4 }).map((_, i) => <NFTCardSkeleton key={i} />)
        ) : ownedPosts.length === 0 ? (
          // Empty state
          <p className='text-gray-400 col-span-full text-center'>No listings yet.</p>
        ) : (
          // Real data
          ownedPosts.map((post, index) => (
            <RentalPostCard
              key={index}
              post={post}
              viewMode='grid'
              onViewRentalPost={() => {}}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default MyListingsSection;
