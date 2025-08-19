'use client';

import { ProfileHeader } from './_components/profile-header';
import { Suspense, useState } from 'react';
import { useParams } from 'next/navigation';
import { NFTCardSkeleton } from '@/components/shared/skeletons/nft-card';
import { NFTCard } from '@/components/shared/nft/nft-card';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useGetNftsByOwner } from '@/queries/nft';
import { Doc } from '../../../../convex/_generated/dataModel';
import NotFound from '@/app/not-found';
import { ListNFTDrawer } from '../../../../temp/lendr/apps/client/src/app/(services)/[address]/_components/list-nft-drawer';

const NFTDetailsModal = dynamic(() => import('./_components/nft-details-modal').then((mod) => mod.NFTDetailsModal), {
    ssr: false,
});

export default function UserProfilePage() {
    const { address } = useParams();
    
    const user = useQuery(api.user.getUserByAddress, { address: address as string });
    const nfts = useGetNftsByOwner(address as string);
    const { data: session } = useSession();

    const [selectedNFTForListing, setSelectedNFTForListing] = useState<Doc<"nft"> | null>(null);
    const [isListDrawerOpen, setIsListDrawerOpen] = useState(false);
    const [selectedNFTForDetails, setSelectedNFTForDetails] = useState<Doc<"nft"> | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const handleViewNFT = (nft: Doc<"nft">) => {
        setSelectedNFTForDetails(nft);
        setIsDetailsModalOpen(true);
    };

    const handleListNFT = (nft: Doc<"nft">) => {
        setSelectedNFTForListing(nft);
        setIsListDrawerOpen(true);
    };

    return (
        <div className='bg-slate-950'>
            <ProfileHeader userDto={user} />

            <div className='max-w-7xl min-h-screen mx-auto py-20'>
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 min-h-[calc(100vh-20rem)]'>
                    {nfts?.map((nft, index) => (
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
                    ))}
                </div>
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

            {/* {selectedNFTForListing && isListDrawerOpen && session && (
                <ListNFTDrawer
                    nft={selectedNFTForListing}
                    isOpen={isListDrawerOpen}
                    onClose={() => setIsListDrawerOpen(false)}
                    session={session}
                    profileAddress={address as string}
                />
            )} */}
        </div>
    );
}