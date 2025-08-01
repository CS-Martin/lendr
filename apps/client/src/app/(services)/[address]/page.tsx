'use client';

import LendrButton from '@/components/shared/lendr-btn';
import { ProfileHeader } from './_components/profile-header';
import { Suspense, useRef, useState } from 'react';
import { OwnedNft } from 'alchemy-sdk';
import { useParams } from 'next/navigation';
import { NFTCardSkeleton } from '@/components/shared/skeletons/nft-card';
import { NFTCard } from '@/components/shared/nft/nft-card';
import dynamic from 'next/dynamic';
import { ListNFTDrawer } from './_components/list-nft-drawer';
import { useSession } from 'next-auth/react';
import NotFound from '@/app/not-found';
import { useShowMoreNFTs } from '@/queries/alchemy-sdk';
import { useGetUserByAddress } from '@/queries/users';
const NFTDetailsModal = dynamic(() => import('./_components/nft-details-modal').then((mod) => mod.NFTDetailsModal), {
    ssr: false,
});

export default function UserProfilePage() {
    const { address } = useParams();
    const { data: fetchedUser, isLoading } = useGetUserByAddress(address as string);
    const { nfts, loadMore, loading: nftsLoading, hasMore } = useShowMoreNFTs(address as string);
    const { data: session } = useSession();

    console.log(nfts)
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

    if (!fetchedUser && !isLoading) {
        return <NotFound />;
    }

    return (
        <div className='bg-slate-950'>
            <ProfileHeader userDto={fetchedUser!} />

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
                    {isLoading && Array.from({ length: 10 }).map((_, index) => <NFTCardSkeleton key={`skeleton-${index}`} />)}
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