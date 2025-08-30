import { Id } from '@convex/_generated/dataModel';

export interface Escrow {
  _id: Id<'escrowSmartContracts'>;
  bidId: Id<'bids'>;
  rentalPostId: Id<'rentalposts'>;
  rentalPostRenterAddress: string;
  rentalPostOwnerAddress: string;
  status: 'ACTIVE' | 'CANCELLED' | 'DEFAULTED' | 'COMPLETED';
  step2ExpiresAt?: number;
  step4ExpiresAt?: number;
}
