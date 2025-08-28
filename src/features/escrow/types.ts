import { Doc, Id } from '@convex/_generated/dataModel';

// Re-defined enums to be used in the frontend
export const EscrowSmartContractStatus = {
  ACTIVE: 'ACTIVE',
  CANCELLED: 'CANCELLED',
  DEFAULTED: 'DEFAULTED',
  COMPLETED: 'COMPLETED',
} as const;

export const EscrowStepStatus = {
  COMPLETED: 'COMPLETED',
  ACTIVE: 'ACTIVE',
  PENDING: 'PENDING',
} as const;

export type EscrowStatus = keyof typeof EscrowSmartContractStatus;
export type StepStatus = keyof typeof EscrowStepStatus;

// Mock data structure that aligns with the Convex schema
export interface EscrowSmartContract {
  escrowContract: Omit<Doc<'escrowSmartContracts'>, 'rentalPostId' | '_id' | '_creationTime'> & {
    _id: Id<'escrowSmartContracts'>;
    _creationTime: number;
    rentalPost: Omit<Doc<'rentalposts'>, '_id' | '_creationTime'> & {
      _id: Id<'rentalposts'>;
      _creationTime: number;
      nft: Doc<'nfts'>;
    };
  };
}
