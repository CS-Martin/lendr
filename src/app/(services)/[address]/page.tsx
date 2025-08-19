'use client';

import { ProfileHeader } from './_components/profile-header';
import { Suspense, useRef, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import { NFTCardSkeleton } from '@/components/shared/skeletons/nft-card';
import { NFTCard } from '@/components/shared/nft/nft-card';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useShowMoreNFTs } from '@/queries/alchemy-sdk';
import LendrButton from '@/components/shared/lendr-btn';
import { OwnedNft } from 'alchemy-sdk';
import NotFound from '@/app/not-found';
import { ListNFTDrawer } from './_components/list-nft-drawer';

const NFTDetailsModal = dynamic(() => import('./_components/nft-details-modal').then((mod) => mod.NFTDetailsModal), {
  ssr: false,
});

export default function UserProfilePage() {
  const { data: session } = useSession();
  const { address } = useParams();

  const user = useQuery(api.user.getUser, { address: address as string });
  const { nfts, loadMore, loading: nftsLoading, hasMore } = useShowMoreNFTs(address as string);

  const [selectedNFTForListing, setSelectedNFTForListing] = useState<OwnedNft | null>(null);
  const [isListDrawerOpen, setIsListDrawerOpen] = useState(false);
  const [selectedNFTForDetails, setSelectedNFTForDetails] = useState<OwnedNft | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Create a ref for the container that holds all NFTs
  const nftContainerRef = useRef<HTMLDivElement>(null);

  const handleLoadMore = async () => {
    await loadMore();

    // Scroll to bottom after new NFTs are loaded
    setTimeout(() => {
      nftContainerRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }, 100);
  };

  // Handle loading state
  if (user === undefined) {
    return <div>Loading user data...</div>;
  }

  // Handle not found state
  if (user === null) {
    return <NotFound />;
  }

  const handleViewNFT = (nft: OwnedNft) => {
    setSelectedNFTForDetails(nft);
    setIsDetailsModalOpen(true);
  };

  const handleListNFT = (nft: OwnedNft) => {
    setSelectedNFTForListing(nft);
    setIsListDrawerOpen(true);
  };

  return (
    <div className='bg-slate-950'>
      <ProfileHeader userDto={user} />

      <div className='max-w-7xl min-h-screen mx-auto py-20'>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 min-h-[calc(100vh-20rem)]'>
          {nfts.map((nft: OwnedNft, index: number) =>
            nft.contract.name ? (
              <Suspense
                key={index}
                fallback={<NFTCardSkeleton />}>
                <NFTCard
                  key={index}
                  nft={nft}
                  onViewNFT={() => handleViewNFT(nft)}
                  onListNFT={() => handleListNFT(nft)}
                  session={session}
                  profileAddress={address as string}
                />
              </Suspense>
            ) : null,
          )}

          {/* Show skeletons while loading more */}
          {nftsLoading && Array.from({ length: 10 }).map((_, index) => <NFTCardSkeleton key={`skeleton-${index}`} />)}
        </div>

        {hasMore && (
          <div className='flex justify-center mt-8'>
            <LendrButton
              onClick={handleLoadMore}
              disabled={nftsLoading}
              className='p-6.5 text-sm'>
              {nftsLoading ? 'Loading...' : 'Load More NFTs'}
            </LendrButton>
          </div>
        )}
      </div>

      {selectedNFTForDetails && isDetailsModalOpen && (
        <NFTDetailsModal
          nft={selectedNFTForDetails}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          session={session}
          profileAddress={address as string}
        />
      )}

      {selectedNFTForListing && isListDrawerOpen && session && (
        <ListNFTDrawer
          nft={selectedNFTForListing}
          isOpen={isListDrawerOpen}
          onClose={() => setIsListDrawerOpen(false)}
          session={session}
          profileAddress={address as string}
        />
      )}
    </div>
  );
}
