'use client';

import LendrButton from '@/components/shared/lendr-btn';
import { NFTCard } from '@/components/shared/nft/nft-card';
import { usePaginatedNFTs } from '@/hooks/useAlchemy';
import { ProfileHeader } from './_components/profile-header';
import { useRef, useState } from 'react';
import { OwnedNft } from 'alchemy-sdk';
import { NFTDetailsModal } from './_components/nft-details-modal';
import { EmptyState } from '../marketplace/_components/empty-state';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';

export default function UserProfilePage() {
    const { data: session } = useSession();

    const [selectedNFTForListing, setSelectedNFTForListing] = useState<OwnedNft | null>(null);
    const [selectedNFTForDetails, setSelectedNFTForDetails] = useState<OwnedNft | null>(null);
    const [isListDrawerOpen, setIsListDrawerOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const { nfts, loadMore, loading, hasMore } = usePaginatedNFTs(
        session?.user?.address,
    );

    // Create a ref for the container that holds all NFTs
    const nftContainerRef = useRef<HTMLDivElement>(null);

    const handleLoadMore = async () => {
        // Save current scroll position if needed
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

    return (
        <div className='bg-slate-950'>
            <ProfileHeader />

            <div className='max-w-7xl min-h-screen mx-auto py-20'>
                {/* If empty */}
                {nfts?.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div
                        className={cn(
                            'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 h-full',
                            nfts?.length === 0 && 'grid-cols-1',
                        )}>
                        {nfts?.map((nft, index) => {
                            if (!nft.name) return null;
                            return (
                                <NFTCard
                                    nft={nft}
                                    key={index}
                                    onViewNFT={() => handleViewNFT(nft)}
                                    onListNFT={() => setSelectedNFTForListing(nft)}
                                />
                            );
                        })}
                    </div>
                )}
                {hasMore && (
                    <div className='flex justify-center mt-8'>
                        <LendrButton
                            onClick={handleLoadMore}
                            disabled={loading}
                            className='p-6.5 text-sm'>
                            {loading ? 'Loading...' : 'Load More NFTs'}
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
                />
            )}
        </div>
    );
}
