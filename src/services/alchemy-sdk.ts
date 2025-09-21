import { Alchemy, Network, OwnedNft, OwnedNftsResponse } from 'alchemy-sdk';

const config = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || '',
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(config);

export class AlchemyService {
  public async getNFTsForAddress(
    walletAddress: string,
    pageKey?: string,
  ): Promise<{ nfts: OwnedNft[]; pageKey?: string }> {
    try {
      const response: OwnedNftsResponse = await alchemy.nft.getNftsForOwner(walletAddress, {
        pageSize: 50, // Increased from 10 to 50 to get more NFTs
        omitMetadata: false,
        pageKey,
      });

      // Filter out spam NFTs and those without a name
      const filteredNfts = response.ownedNfts.filter(
        (nft) => !nft.contract.isSpam && nft.name && nft.name.trim() !== '',
      );

      // If we don't have enough NFTs after filtering, try to get more
      if (filteredNfts.length < 10 && response.pageKey) {
        const nextPage = await this.getNFTsForAddress(walletAddress, response.pageKey);
        return {
          nfts: [...filteredNfts, ...nextPage.nfts].slice(0, 10), // Return up to 10 NFTs
          pageKey: nextPage.pageKey,
        };
      }

      return {
        nfts: filteredNfts.slice(0, 10), // Return up to 10 NFTs
        pageKey: response.pageKey,
      };
    } catch (error) {
      console.error('Failed to fetch NFTs:', error);
      return { nfts: [] };
    }
  }
}

export const alchemyService = new AlchemyService();
