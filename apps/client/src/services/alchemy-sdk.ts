import { Alchemy, Network, OwnedNft, OwnedNftsResponse } from 'alchemy-sdk';

const config = {
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || '',
    network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(config);

export class AlchemyService {
    public async getNFTsForAddress(
        walletAddress: string,
    ): Promise<{ nfts: OwnedNft[] }> {
        try {
            const response: OwnedNftsResponse = await alchemy.nft.getNftsForOwner(walletAddress, {
                pageSize: 10,
                omitMetadata: false,
                excludeFilters: [],
            });

            return {
                nfts: response.ownedNfts,
            };
        } catch (error) {
            console.error('Failed to fetch NFTs:', error);
            return { nfts: [] };
        }
    }
}

export const alchemyService = new AlchemyService();
