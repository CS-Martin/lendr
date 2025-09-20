import { Alchemy, Network, OwnedNft, OwnedNftsResponse } from 'alchemy-sdk';

// Create Alchemy clients per network to ensure requests are made against the
// currently connected chain. We cache instances by Network for reuse.
const alchemyClientsByNetwork: Map<Network, Alchemy> = new Map();

const getAlchemyClient = (network: Network): Alchemy => {
  const existing = alchemyClientsByNetwork.get(network);
  if (existing) return existing;

  const client = new Alchemy({
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || '',
    network,
  });

  alchemyClientsByNetwork.set(network, client);
  return client;
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
      });

      // Filter out spam NFTs and those without a name
      const filteredNfts = response.ownedNfts.filter(
        (nft) => !nft.contract.isSpam && nft.name && nft.name.trim() !== '',
      );

      // If we don't have enough NFTs after filtering, try to get more
      if (filteredNfts.length < 10 && response.pageKey) {
        const nextPage = await this.getNFTsForAddress(walletAddress, response.pageKey, chainId);
        return {
          nfts: [...filteredNfts, ...nextPage.nfts].slice(0, 10),
          pageKey: nextPage.pageKey,
        };
      }

      return {
        nfts: filteredNfts.slice(0, 10),
        pageKey: response.pageKey,
      };
    } catch (error) {
      console.error('Failed to fetch NFTs:', error);
      return { nfts: [] };
    }
  }
}

export const alchemyService = new AlchemyService();
