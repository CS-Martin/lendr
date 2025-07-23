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
  const [pageKey, setPageKey] = useState<string | undefined>();

  const loadNFTs = async (initialLoad = false) => {
    if (loading || (!initialLoad && !hasMore)) return;

    setLoading(true);

    try {
      const { nfts: newNfts, pageKey: newPageKey } = await alchemyService.getNFTsForAddress(
        walletAddress,
        initialLoad ? undefined : pageKey,
      );

      setNfts((prev) => (initialLoad ? newNfts : [...prev, ...newNfts]));
      setPageKey(newPageKey);
      setHasMore(!!newPageKey);
    } catch (error) {
      console.error('Error loading NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadNFTs(true);
  }, [walletAddress]);

  return {
    nfts,
    loadMore: () => loadNFTs(false),
    loading,
    hasMore,
  };
};
