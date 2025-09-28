import { action } from './_generated/server';
import { v } from 'convex/values';

// Action to initiate delegation rental payment (Step 1)
export const initiateDelegationRentalPayment = action({
  args: {
    rentalId: v.string(),
    payment: v.string(), // Payment amount in wei
  },
  handler: async (ctx, args) => {
    try {
      const apiResponse = await fetch('https://lendr.gabcat.dev/delegation/initiate-delegation-rental', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rentalId: args.rentalId,
          payment: args.payment,
        }),
      });

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        throw new Error(`Payment failed with status: ${apiResponse.status} - ${errorText}`);
      }

      const result = await apiResponse.json();
      return { success: true, result };
    } catch (error) {
      console.error('Failed to initiate delegation rental payment:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

// Action to deposit NFT by lender (Step 4)
export const depositNFTbyLender = action({
  args: {
    rentalId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log('Deposit NFT by Lender Request:', args);
    try {
      const apiResponse = await fetch('https://lendr.gabcat.dev/delegation/deposit-nft-by-lender', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rentalId: args.rentalId,
        }),
      });

      console.log('Deposit NFT by Lender Response:', apiResponse);

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        throw new Error(`NFT deposit failed with status: ${apiResponse.status} - ${errorText}`);
      }

      const result = await apiResponse.json();
      return { success: true, result };
    } catch (error) {
      console.error('Failed to deposit NFT by lender:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

// Action to activate delegation (Step 5)
export const activateDelegation = action({
  args: {
    rentalId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log('Activate Delegation Request:', args);
    try {
      const apiResponse = await fetch('https://lendr.gabcat.dev/delegation/activate-delegation', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rentalId: args.rentalId,
        }),
      });

      console.log('Activate Delegation Response:', apiResponse);

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        throw new Error(`Delegation activation failed with status: ${apiResponse.status} - ${errorText}`);
      }

      const result = await apiResponse.json();
      return { success: true, result };
    } catch (error) {
      console.error('Failed to activate delegation:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

// Action to complete delegation rental (Settlement Step)
export const completeDelegationRental = action({
  args: {
    rentalId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log('Complete Delegation Rental Request:', args);
    try {
      const apiResponse = await fetch('https://lendr.gabcat.dev/delegation/complete-delegation-rental', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rentalId: args.rentalId,
        }),
      });

      console.log('Complete Delegation Rental Response:', apiResponse);

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        throw new Error(`Delegation completion failed with status: ${apiResponse.status} - ${errorText}`);
      }

      const result = await apiResponse.json();
      return { success: true, result };
    } catch (error) {
      console.error('Failed to complete delegation rental:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
