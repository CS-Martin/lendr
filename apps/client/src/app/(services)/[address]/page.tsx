'use client';

import LendrButton from '@/components/shared/lendr-btn';
import { useShowMoreNFTs } from '@/hooks/useAlchemy';
import { ProfileHeader } from './_components/profile-header';
import { useRef, useState } from 'react';
import { OwnedNft } from 'alchemy-sdk';
import { useParams } from 'next/navigation';
import { NFTCardSkeleton } from '@/components/shared/skeletons/nft-card';
import { EmptyState } from '../marketplace/_components/empty-state';
import { NFTCard } from '@/components/shared/nft/nft-card';
import dynamic from 'next/dynamic';
import { ListNFTDrawer } from './_components/list-nft-drawer';
import { useSession } from 'next-auth/react';
import { useFindOneUser } from '@/hooks/useUser';
import NotFound from '@/app/not-found';
const NFTDetailsModal = dynamic(() => import('./_components/nft-details-modal').then((mod) => mod.NFTDetailsModal), {
  ssr: false,
});

export default function UserProfilePage() {
  const { address } = useParams();
  const { fetchedUser, loading } = useFindOneUser(address as string);
  const { nfts, loadMore, loading: nftsLoading, hasMore } = useShowMoreNFTs(address as string);
  const { data: session } = useSession();

  console.log('Session:', session);

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

  const handleViewNFT = (nft: OwnedNft) => {
    setSelectedNFTForDetails(nft);
    setIsDetailsModalOpen(true);
  };

  const handleListNFT = (nft: OwnedNft) => {
    setSelectedNFTForListing(nft);
    setIsListDrawerOpen(true);
  };

  if (!fetchedUser && !loading) {
    return <NotFound />;
  }

  return (
    <div className='bg-slate-950'>
      <ProfileHeader userDto={fetchedUser} />

      <div className='max-w-7xl min-h-screen mx-auto py-20'>
        {nfts.length === 0 && !loading ? (
          <EmptyState
            title='No NFTs Found'
            description='No NFTs found for this user'
          />
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 min-h-[calc(100vh-20rem)]'>
            {nfts.map((nft, index) =>
              nft.name ? (
                <NFTCard
                  key={index}
                  nft={nft}
                  onViewNFT={() => handleViewNFT(nft)}
                  onListNFT={() => handleListNFT(nft)}
                  session={session}
                  profileAddress={address as string}
                />
              ) : null,
            )}

            {/* Show skeletons while loading more */}
            {loading && Array.from({ length: 10 }).map((_, index) => <NFTCardSkeleton key={`skeleton-${index}`} />)}
          </div>
        )}

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

      <div ref={nftContainerRef} />

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
