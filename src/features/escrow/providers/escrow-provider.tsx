'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Doc, Id } from '../../../../convex/_generated/dataModel';
import { useAccount } from 'wagmi';
import { useProgress } from '@bprogress/next';

interface EscrowLifecycleContextType {
  escrow: Doc<'escrowSmartContracts'> | null;
  steps: Doc<'escrowSmartContractSteps'>[];
  isLender: boolean;
  isRenter: boolean;
  currentStep: Doc<'escrowSmartContractSteps'> | null;
  rentalPost: Doc<'rentalposts'> | null;
  bid: Doc<'bids'> | null;
  timeRemainingStep2: number;
  rentalDuration: number;
  rentalStartTime: number;
  isLoading: boolean;
  error: Error | null;
  setRentalPostId: (rentalPostId: Id<'rentalposts'>) => void;
  completeStep: (args: { escrowId: Id<'escrowSmartContracts'>; stepNumber: number; txHash?: string }) => Promise<void>;
  completeStep4Settlement: (args: { escrowId: Id<'escrowSmartContracts'>; txHash?: string }) => Promise<void>;
  checkDeadlines: (escrowId: Id<'escrowSmartContracts'>) => Promise<void>;
  forceCompleteRentalProcess: (args: { escrowId: Id<'escrowSmartContracts'>; txHash?: string }) => Promise<void>;
  cancelEscrow: (escrowId: Id<'escrowSmartContracts'>) => Promise<void>;
  defaultEscrow: (escrowId: Id<'escrowSmartContracts'>) => Promise<void>;
  settleEscrow: (escrowId: Id<'escrowSmartContracts'>) => Promise<void>;
}

const EscrowLifecycleContext = createContext<EscrowLifecycleContextType | undefined>(undefined);

export const EscrowLifecycleProvider = ({ children }: { children: ReactNode }) => {
  const { start, stop } = useProgress();
  const { address } = useAccount();
  const [rentalPostId, setRentalPostId] = useState<Id<'rentalposts'> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const escrowData = useQuery(api.escrowSmartContract.getEscrowSmartContract, rentalPostId ? { rentalPostId } : 'skip');
  const rentalPost = useQuery(api.rentalpost.get, escrowData?.rentalPostId ? { id: escrowData.rentalPostId } : 'skip');
  const bid = useQuery(api.bids.getBidById, escrowData?.bidId ? { bidId: escrowData.bidId } : 'skip');

  const completeStepMutation = useMutation(api.escrowSmartContractStep.completeStep);
  const completeStep4SettlementMutation = useMutation(api.escrowSmartContractStep.completeStep4Settlement);
  const checkDeadlinesMutation = useMutation(api.escrowSmartContractStep.checkDeadlines);
  const forceCompleteRentalProcessMutation = useMutation(api.escrowSmartContract.forceCompleteRentalProcess);
  const cancelEscrowMutation = useMutation(api.escrowSmartContract.cancelEscrow);
  const defaultEscrowMutation = useMutation(api.escrowSmartContract.defaultEscrow);
  const settleEscrowMutation = useMutation(api.escrowSmartContract.settleEscrow);

  const steps = useMemo(() => (escrowData ? escrowData.steps : []), [escrowData]);
  const currentStep = useMemo(() => steps.find((step) => step.status === 'ACTIVE') || null, [steps]);

  const isLender = address === escrowData?.rentalPostOwnerAddress;
  const isRenter = address === escrowData?.rentalPostRenterAddress;

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

  const completeStep4Settlement = async (args: { escrowId: Id<'escrowSmartContracts'>; txHash?: string }) => {
    setIsLoading(true);
    try {
      await completeStep4SettlementMutation(args);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkDeadlines = async (escrowId: Id<'escrowSmartContracts'>) => {
    setIsLoading(true);
    try {
      await checkDeadlinesMutation({ escrowId });
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const forceCompleteRentalProcess = async (args: { escrowId: Id<'escrowSmartContracts'>; txHash?: string }) => {
    setIsLoading(true);
    try {
      await forceCompleteRentalProcessMutation(args);
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

  // Run bProgress if loading
  useEffect(() => {
    if (isLoading) {
      start();
    } else {
      stop();
    }
  }, [isLoading, start, stop]);

  const value = {
    escrow: escrowData || null,
    steps,
    currentStep,
    isLender,
    isRenter,
    rentalPost: rentalPost || null,
    bid: bid || null,
    timeRemainingStep2: escrowData?.step2ExpiresAt || 0,
    rentalDuration: bid?.rentalDuration || 0,
    rentalStartTime: escrowData?.rentalStartTime || 0,
    isLoading: isLoading || (escrowData === undefined && rentalPostId !== null),
    error,
    setRentalPostId,
    completeStep,
    completeStep4Settlement,
    checkDeadlines,
    forceCompleteRentalProcess,
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
