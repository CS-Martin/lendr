import { action } from './_generated/server';
import { v } from 'convex/values';

// Action to create delegation rental agreement via external API
export const createDelegationRentalAgreement = action({
  args: {
    lender: v.string(),
    nftContract: v.string(),
    tokenId: v.string(),
    hourlyRentalFee: v.string(),
    rentalDurationInHours: v.string(),
    nftStandard: v.number(),
    dealDuration: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      const apiResponse = await fetch('https://lendr.gabcat.dev/factory/create-delegation-rental-agreement', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(args),
      });

      if (!apiResponse.ok) {
        throw new Error(`API call failed with status: ${apiResponse.status}`);
      }

      const result = await apiResponse.json();
      return { success: true, smartContractRentalId: result.result };
    } catch (error) {
      console.error('Failed to create delegation rental agreement:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
