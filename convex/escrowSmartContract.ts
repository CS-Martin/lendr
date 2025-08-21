import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { rentalpost } from './rentalpost';

export const EscrowSmartContractStatus = v.union(
  v.literal('ACTIVE'), // Rental in progress
  v.literal('COMPLETED'), // Rental finished successfully
  v.literal('DISPUTED_FOR_LENDER'), // Renter violated rules; lender opened dispute
  v.literal('DISPUTED_FOR_RENTER'), // Lender violated rules; renter opened dispute
);

export const escrowSmartContract = defineTable({
  rentalPost: v.id('rentalPosts'),
  rentalPostRenterAddress: v.id('users'),
  rentalPostOwnerAddress: v.id('users'),
  rentalFee: v.number(),
  collateral: v.number(),
  status: EscrowSmartContractStatus,
});
