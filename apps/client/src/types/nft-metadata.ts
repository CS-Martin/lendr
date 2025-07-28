// types/nft-metadata.ts
export interface AlchemyNFTMetadata {
  contract: {
    address?: string;
    name?: string;
    symbol?: string;
    tokenType?: string;
    contractDeployer?: string;
    deployedBlockNumber?: number;
    openSeaMetadata?: {
      floorPrice?: number;
      collectionName?: string;
      collectionSlug?: string;
      safelistRequestStatus?: string;
      imageUrl?: string;
      description?: string;
      bannerImageUrl?: string;
      lastIngestedAt?: string;
    };
    isSpam?: boolean;
    spamClassifications?: string[];
  };
  tokenId: string;
  tokenType?: string;
  name?: string;
  description?: string;
  tokenUri?: string;
  image?: {
    cachedUrl?: string;
    thumbnailUrl?: string;
    pngUrl?: string;
    contentType?: string;
    size?: number;
    originalUrl?: string;
  };
  animation?: Record<string, unknown>;
  raw?: {
    tokenUri?: string;
    metadata?: {
      name?: string;
      description?: string;
      image?: string;
      attributes?: Array<{
        value: string;
        trait_type: string;
      }>;
    };
  };
  collection?: {
    name?: string;
    slug?: string;
    bannerImageUrl?: string;
  };
  mint?: Record<string, unknown>;
  timeLastUpdated?: string;
  balance?: string;
  acquiredAt?: Record<string, unknown>;
}
