'use client';

import { alchemyService } from '@/services/alchemy-sdk';
import { useProgress } from '@bprogress/next';
import { OwnedNft } from 'alchemy-sdk';
import { useEffect, useState } from 'react';
import { useChainId } from 'wagmi';

export const useGetNFTsForAddress = (address: string) => {
  const chainId = useChainId();
  const { start, stop } = useProgress();
  const [nfts, setNfts] = useState<OwnedNft[] | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        start();
        const { nfts: newNfts } = await alchemyService.getNFTsForAddress(address, undefined, chainId);

        setNfts(newNfts);
      } catch (err) {
        setError(err as Error);
      } finally {
        stop();
      }
    };

    fetchData();
  }, [start, stop, address, chainId]);

  return { nfts, error };
};

export const useShowMoreNFTs = (walletAddress: string) => {
  const { start, stop } = useProgress();
  const chainId = useChainId();
  const [nfts, setNfts] = useState<OwnedNft[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pageKey, setPageKey] = useState<string | undefined>();

  const loadNFTs = async (initialLoad = false) => {
    if (loading || (!initialLoad && !hasMore)) return;

    setLoading(true);

    try {
      start();
      const { nfts: newNfts, pageKey: newPageKey } = await alchemyService.getNFTsForAddress(
        walletAddress,
        initialLoad ? undefined : pageKey,
        chainId,
      );

      setNfts((prev) => (initialLoad ? newNfts : [...prev, ...newNfts]));
      setPageKey(newPageKey);
      setHasMore(!!newPageKey);
    } catch (error) {
      console.error('Error loading NFTs:', error);
    } finally {
      setLoading(false);
      stop();
    }
  };

  // Reset state and load when address or chain changes
  useEffect(() => {
    setNfts([]);
    setPageKey(undefined);
    setHasMore(true);
    loadNFTs(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress, chainId]);

  return {
    nfts,
    loadMore: () => loadNFTs(false),
    loading,
    hasMore,
  };
};
