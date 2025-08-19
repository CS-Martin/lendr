'use client';

import { alchemyService } from '@/services/alchemy-sdk';
import { useQuery } from '@tanstack/react-query';
import { useConvex, useQuery as useConvexQuery } from "convex/react";
import { api } from '../../convex/_generated/api';

export const useGetNFTsForAddress = (address: string) => {
  return useQuery({
    queryKey: ['nfts', address],
    queryFn: () => alchemyService.getNFTsForAddress(address),
  });
};

export const useGetNftsByOwner = (ownerAddress: string) => {
    const convex = useConvex();
    return useConvexQuery(
        api.nft.getNftsByOwner,
        ownerAddress ? { ownerAddress } : "skip"
    );
};
