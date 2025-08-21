'use client';

import NotFound from '@/app/not-found';
import { OwnedNft } from 'alchemy-sdk';
import { useEffect, useRef, useState, Suspense } from 'react';
import { ProfileHeader } from '@/features/profile/components/profile-header';
import { NFTCard } from '@/components/shared/nft-components/nft-card';
import { NFTCardSkeleton } from '@/components/shared/skeletons/nft-card';
import { NFTDetailsModal } from '@/features/profile/components/nft-details-modal';
import { ListNFTDrawer } from '@/features/profile/components/list-nft-drawer';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { useShowMoreNFTs } from '@/queries/alchemy-sdk';
import { api } from '../../../../../convex/_generated/api';

export default function UserProfilePage() {
  const { data: session } = useSession();
  const { address } = useParams();

  const user = useQuery(api.user.getUser, { address: address as string });
  const { nfts, loadMore, loading: nftsLoading, hasMore } = useShowMoreNFTs(address as string);

  const [selectedNFTForListing, setSelectedNFTForListing] = useState<OwnedNft | null>(null);
  const [isListDrawerOpen, setIsListDrawerOpen] = useState(false);
  const [selectedNFTForDetails, setSelectedNFTForDetails] = useState<OwnedNft | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // 👇 Sentinel ref for infinite scroll
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore || nftsLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 1.0 },
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) observer.observe(currentSentinel);

    return () => {
      if (currentSentinel) observer.unobserve(currentSentinel);
    };
  }, [hasMore, nftsLoading, loadMore]);

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
      <ProfileHeader user={user} />

      <div className='max-w-7xl min-h-screen mx-auto py-20'>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 min-h-[calc(100vh-20rem)]'>
          {nfts.map((nft: OwnedNft, index: number) =>
            nft.contract.name ? (
              <Suspense
                key={index}
                fallback={<NFTCardSkeleton />}>
                <NFTCard
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

        {/* 👇 Sentinel for infinite scroll */}
        {hasMore && (
          <div
            ref={sentinelRef}
            className='h-10'
          />
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
