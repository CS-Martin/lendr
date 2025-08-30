'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Doc, Id } from '../../../../convex/_generated/dataModel';

interface EscrowLifecycleContextType {
  escrow: Doc<'escrowSmartContracts'> | null;
  steps: Doc<'escrowSmartContractSteps'>[];
  currentStep: Doc<'escrowSmartContractSteps'> | null;
  rentalPost: Doc<'rentalposts'> | null;
  bid: Doc<'bids'> | null;
  timeRemainingStep2: number;
  timeRemainingStep4: number;
  isLoading: boolean;
  error: Error | null;
  setRentalPostId: (rentalPostId: Id<'rentalposts'>) => void;
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
  const [timeRemainingStep2, setTimeRemainingStep2] = useState(0);
  const [timeRemainingStep4, setTimeRemainingStep4] = useState(0);

  const escrowData = useQuery(api.escrowSmartContract.getEscrowSmartContract, rentalPostId ? { rentalPostId } : 'skip');
  const rentalPost = useQuery(api.rentalpost.get, escrowData?.rentalPostId ? { id: escrowData.rentalPostId } : 'skip');
  const bid = useQuery(api.bids.getBidById, escrowData?.bidId ? { bidId: escrowData.bidId } : 'skip');

  console.log('escrowData', escrowData);
  console.log('rentalPost', rentalPost);
  console.log('bid', bid);

  const completeStepMutation = useMutation(api.escrowSmartContractStep.completeStep);
  const cancelEscrowMutation = useMutation(api.escrowSmartContract.cancelEscrow);
  const defaultEscrowMutation = useMutation(api.escrowSmartContract.defaultEscrow);
  const settleEscrowMutation = useMutation(api.escrowSmartContract.settleEscrow);

  const steps = useMemo(() => (escrowData ? escrowData.steps : []), [escrowData]);
  const currentStep = useMemo(() => steps.find((step) => step.status === 'ACTIVE') || null, [steps]);

  useEffect(() => {
    if (escrowData?.step2ExpiresAt) {
      const interval = setInterval(() => {
        const remaining = escrowData.step2ExpiresAt - Date.now();
        setTimeRemainingStep2(Math.max(0, remaining));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [escrowData?.step2ExpiresAt]);

  useEffect(() => {
    if (escrowData?.step4ExpiresAt) {
      const interval = setInterval(() => {
        const remaining = escrowData.step4ExpiresAt - Date.now();
        setTimeRemainingStep4(Math.max(0, remaining));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [escrowData?.step4ExpiresAt]);

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
    escrow: escrowData || null,
    steps,
    currentStep,
    rentalPost: rentalPost || null,
    bid: bid || null,
    timeRemainingStep2,
    timeRemainingStep4,
    isLoading: isLoading || (escrowData === undefined && rentalPostId !== null),
    error,
    setRentalPostId,
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
