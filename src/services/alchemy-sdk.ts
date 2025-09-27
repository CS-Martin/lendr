import { Alchemy, Network, OwnedNft, OwnedNftsResponse, NftFilters } from 'alchemy-sdk';

const config = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || '',
  network: Network.MATIC_AMOY,
};

// Map wagmi/viem chain ids to Alchemy Network enum. Defaults to ETH_MAINNET.
const mapChainIdToAlchemyNetwork = (chainId?: number): Network => {
  switch (chainId) {
    case 1:
      return Network.ETH_MAINNET;
    case 11155111:
      return Network.ETH_SEPOLIA;
    case 10:
      return Network.OPT_MAINNET;
    case 42161:
      return Network.ARB_MAINNET;
    case 137:
      return Network.MATIC_MAINNET;
    case 8453:
      return Network.BASE_MAINNET;
    default:
      return Network.ETH_MAINNET;
  }
};

export class AlchemyService {
  public async getNFTsForAddress(
    walletAddress: string,
    pageKey?: string,
    chainId?: number,
  ): Promise<{ nfts: OwnedNft[]; pageKey?: string }> {
    try {
      const network = mapChainIdToAlchemyNetwork(chainId);
      const alchemy = getAlchemyClient(network);

      const response: OwnedNftsResponse = await alchemy.nft.getNftsForOwner(walletAddress, {
        pageSize: 50, // fetch more per request to improve UX
        omitMetadata: false,
        pageKey,
        // Use Alchemy's server-side spam filter rather than client-side checks
        excludeFilters: [NftFilters.SPAM],
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
