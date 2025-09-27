import { Alchemy, Network, OwnedNft, OwnedNftsResponse } from 'alchemy-sdk';

const config = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || '',
  network: Network.MATIC_AMOY, // Changed to mainnet for testing
};

const getAlchemyClient = (network: Network) => {
  return new Alchemy({
    apiKey: config.apiKey,
    network,
  });
};

// Always use MATIC_AMOY network
const mapChainIdToAlchemyNetwork = (chainId?: number): Network => {
  return Network.MATIC_AMOY;
};

export class AlchemyService {
  public async getNFTsForAddress(
    walletAddress: string,
    pageKey?: string,
    chainId?: number,
  ): Promise<{ nfts: OwnedNft[]; pageKey?: string }> {
    try {
      // Check API key
      if (!config.apiKey) {
        console.error('Alchemy API key is missing. Please set NEXT_PUBLIC_ALCHEMY_API_KEY');
        return { nfts: [] };
      }

      const network = mapChainIdToAlchemyNetwork(chainId);

      const alchemy = getAlchemyClient(network);

      const response: OwnedNftsResponse = await alchemy.nft.getNftsForOwner(walletAddress, {
        pageSize: 50, // fetch more per request to improve UX
        omitMetadata: false,
        pageKey,
      });

      // Do not over-filter results client-side; rely on API filters only
      // and return a bounded slice for UI rendering.
      return {
        nfts: response.ownedNfts.slice(0, 10),
        pageKey: response.pageKey,
      };
    } catch (error) {
      console.error('Failed to fetch NFTs:', error);
      return { nfts: [] };
    }
  }
}

export const alchemyService = new AlchemyService();
