'use client';

import { alchemyService } from '@/services/alchemy-sdk';
import { useQuery } from '@tanstack/react-query';
import { useChainId } from 'wagmi';

export const useGetNFTsForAddress = (address: string) => {
  const chainId = useChainId();
  return useQuery({
    queryKey: ['nfts', address, chainId],
    queryFn: () => alchemyService.getNFTsForAddress(address, undefined, chainId),
  });
};
