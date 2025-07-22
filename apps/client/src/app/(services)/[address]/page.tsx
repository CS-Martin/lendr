'use client';

import { GridBackground } from '@/components/shared/grid-background';
import LendrButton from '@/components/shared/lendr-btn';
import { NFTCard } from '@/components/shared/nft/nft-card';
import { useGetNFTsForAddress, usePaginatedNFTs } from '@/hooks/useAlchemy';
import { ProfileHeader } from './_components/profile-header';
import { useRef, useEffect, useState } from 'react';
import { OwnedNft } from 'alchemy-sdk';
import { NFTDetailsModal } from './_components/nft-details-modal';
import { useAccount } from 'wagmi';
import { WalletConnectButton } from '@/components/shared/custom-connect';

export default function UserProfilePage() {
    const { address } = useAccount();

    const [selectedNFTForListing, setSelectedNFTForListing] = useState<OwnedNft | null>(null)
    const [selectedNFTForDetails, setSelectedNFTForDetails] = useState<OwnedNft | null>(null)
    const [isListDrawerOpen, setIsListDrawerOpen] = useState(false)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

    console.log(address)
    const { nfts, loadMore, loading, hasMore } = usePaginatedNFTs(
        '0xd97bbd623e3ff9a12fa79b678e03b4cdeeaf4f29',
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
        setSelectedNFTForDetails(nft)
        setIsDetailsModalOpen(true)
    }

    return (
        <div className='bg-slate-950'>
            <ProfileHeader />

            <div className='max-w-7xl min-h-screen mx-auto py-20'>
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 h-full'>
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

            <NFTDetailsModal nft={selectedNFTForDetails} isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} />
        </div>
    );
}
