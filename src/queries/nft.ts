'use client';

import { alchemyService } from '@/services/alchemy-sdk';
import { useQuery } from '@tanstack/react-query';

export const useGetNFTsForAddress = (address: string) => {
  return useQuery({
    queryKey: ['nfts', address],
    queryFn: () => alchemyService.getNFTsForAddress(address),
  });
};
