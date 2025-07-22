'use client';

import { alchemyService } from '@/services/alchemy-sdk';
import { useProgress } from '@bprogress/next';
import { OwnedNft } from 'alchemy-sdk';
import { useEffect, useState } from 'react';

export const useGetNFTsForAddress = (address: string) => {
  const { start, stop } = useProgress();
  const [nfts, setNfts] = useState<OwnedNft[] | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        start();
        const { nfts: newNfts } = await alchemyService.getNFTsForAddress(address);

        setNfts(newNfts);
      } catch (err) {
        setError(err as Error);
      } finally {
        stop();
      }
    };

    fetchData();
  }, [start, stop, address]);

  return { nfts, error };
};

export const useShowMoreNFTs = (walletAddress: string) => {
  const [nfts, setNfts] = useState<OwnedNft[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadNFTs = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const { nfts: newNfts } = await alchemyService.getNFTsForAddress(walletAddress);
    setNfts((prev) => [...prev, ...newNfts]);
    setHasMore(newNfts.length > 0);
    setLoading(false);
  };

  useEffect(() => {
    loadNFTs();
  }, []);

  return {
    nfts,
    loadMore: loadNFTs,
    loading,
    hasMore,
  };
};
