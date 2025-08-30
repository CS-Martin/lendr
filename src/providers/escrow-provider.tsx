'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface Escrow {
  _id: Id<'escrowSmartContracts'>;
  bidId: Id<'bids'>;
  rentalPostId: Id<'rentalposts'>;
  rentalPostRenterAddress: string;
  rentalPostOwnerAddress: string;
  status: 'ACTIVE' | 'CANCELLED' | 'DEFAULTED' | 'COMPLETED';
  step2ExpiresAt?: number;
  step4ExpiresAt?: number;
}

interface EscrowStep {
  _id: Id<'escrowSmartContractSteps'>;
  escrowId: Id<'escrowSmartContracts'>;
  stepNumber: number;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED';
  txHash?: string;
  timestamp: number;
}

interface EscrowLifecycleContextType {
  escrow: Escrow | null;
  steps: EscrowStep[];
  isLoading: boolean;
  error: Error | null;
  setRentalPostId: (rentalPostId: Id<'rentalposts'>) => void;
  createEscrow: (args: {
    bidId: Id<'bids'>;
    rentalPostId: Id<'rentalposts'>;
    rentalPostRenterAddress: string;
    rentalPostOwnerAddress: string;
  }) => Promise<void>;
  completeStep: (args: { escrowId: Id<'escrowSmartContracts'>; stepNumber: number; txHash?: string }) => Promise<void>;
  cancelEscrow: (escrowId: Id<'escrowSmartContracts'>) => Promise<void>;
  defaultEscrow: (escrowId: Id<'escrowSmartContracts'>) => Promise<void>;
  settleEscrow: (escrowId: Id<'escrowSmartContracts'>) => Promise<void>;
}

const EscrowLifecycleContext = createContext<EscrowLifecycleContextType | undefined>(undefined);

export const EscrowLifecycleProvider = ({ children }: { children: ReactNode }) => {
  const [rentalPostId, setRentalPostId] = useState<Id<'rentalposts'> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const escrowData = useQuery(api.escrowSmartContract.getEscrowSmartContract, rentalPostId ? { rentalPostId } : 'skip');

  const createEscrowMutation = useMutation(api.escrowSmartContract.createEscrowSmartContract);
  const completeStepMutation = useMutation(api.escrowSmartContractStep.completeStep);
  const cancelEscrowMutation = useMutation(api.escrowSmartContract.cancelEscrow);
  const defaultEscrowMutation = useMutation(api.escrowSmartContract.defaultEscrow);
  const settleEscrowMutation = useMutation(api.escrowSmartContract.settleEscrow);

  const createEscrow = async (args: {
    bidId: Id<'bids'>;
    rentalPostId: Id<'rentalposts'>;
    rentalPostRenterAddress: string;
    rentalPostOwnerAddress: string;
  }) => {
    setIsLoading(true);
    try {
      const escrowId = await createEscrowMutation({
        ...args,
        status: 'ACTIVE',
      });
      setRentalPostId(args.rentalPostId);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeStep = async (args: { escrowId: Id<'escrowSmartContracts'>; stepNumber: number; txHash?: string }) => {
    setIsLoading(true);
    try {
      await completeStepMutation(args);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEscrow = async (escrowId: Id<'escrowSmartContracts'>) => {
    setIsLoading(true);
    try {
      await cancelEscrowMutation({ id: escrowId });
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const defaultEscrow = async (escrowId: Id<'escrowSmartContracts'>) => {
    setIsLoading(true);
    try {
      await defaultEscrowMutation({ id: escrowId });
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const settleEscrow = async (escrowId: Id<'escrowSmartContracts'>) => {
    setIsLoading(true);
    try {
      await settleEscrowMutation({ id: escrowId });
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    escrow: escrowData ? escrowData : null,
    steps: escrowData ? escrowData.steps : [],
    isLoading: isLoading || (escrowData === undefined && rentalPostId !== null),
    error,
    setRentalPostId,
    createEscrow,
    completeStep,
    cancelEscrow,
    defaultEscrow,
    settleEscrow,
  };

  return <EscrowLifecycleContext.Provider value={value}>{children}</EscrowLifecycleContext.Provider>;
};

export const useEscrowLifecycle = () => {
  const context = useContext(EscrowLifecycleContext);
  if (context === undefined) {
    throw new Error('useEscrowLifecycle must be used within an EscrowLifecycleProvider');
  }
  return context;
};
