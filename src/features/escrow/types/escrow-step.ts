import { Id } from '@convex/_generated/dataModel';

export type EscrowSmartContractStatus = 'ACTIVE' | 'CANCELLED' | 'DEFAULTED' | 'COMPLETED';
export type StepStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED';
export interface EscrowStep {
  _id: Id<'escrowSmartContractSteps'>;
  escrowId: Id<'escrowSmartContracts'>;
  stepNumber: number;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED';
  txHash?: string;
  timestamp: number;
}
