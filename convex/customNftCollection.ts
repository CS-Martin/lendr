import { action } from './_generated/server';
import { v } from 'convex/values';

// Action to approve NFT for delegation registry (Step 2)
export const approveNftForDelegation = action({
  args: {
    tokenId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log('Approve NFT for Delegation Request:', args);
    try {
      const apiResponse = await fetch('https://lendr.gabcat.dev/custom-nft-collection/approve', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: '0x6F7FF4977DA0253AcEEFf5389a86f8f67F371E4E', // DELEGATION_REGISTRY_ADDRESS
          tokenId: args.tokenId,
        }),
      });

      console.log('Approve NFT for Delegation Response:', apiResponse);

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        throw new Error(`NFT approval failed with status: ${apiResponse.status} - ${errorText}`);
      }

      const result = await apiResponse.json();
      return { success: true, result };
    } catch (error) {
      console.error('Failed to approve NFT for delegation:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
