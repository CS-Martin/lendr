import { createContext, useContext, ReactNode } from 'react';
import { Doc } from '@convex/_generated/dataModel';

interface EscrowLifecycleContextProps {
  bid: Doc<'bids'>;
  rentalPost: Doc<'rentalposts'>;
  escrowData: Doc<'escrowSmartContracts'>;
  timeRemaining: {
    step2: { days: number; hours: number; minutes: number; seconds: number };
    step4: { days: number; hours: number; minutes: number; seconds: number };
  };
}

const EscrowLifecycleContext = createContext<EscrowLifecycleContextProps | undefined>(undefined);

export const useEscrowLifecycle = () => {
  const context = useContext(EscrowLifecycleContext);

  if (!context) {
    throw new Error('useEscrowLifecycle must be used within an EscrowLifecycleProvider');
  }

  return context;
};

interface EscrowLifecycleProviderProps {
  children: ReactNode;
  bid: Doc<'bids'>;
  rentalPost: Doc<'rentalposts'>;
  escrowData: Doc<'escrowSmartContracts'>;
  timeRemaining: {
    step2: { days: number; hours: number; minutes: number; seconds: number };
    step4: { days: number; hours: number; minutes: number; seconds: number };
  };
}

export const EscrowLifecycleProvider = ({
  children,
  bid,
  rentalPost,
  escrowData,
  timeRemaining,
}: EscrowLifecycleProviderProps) => {
  return (
    <EscrowLifecycleContext.Provider value={{ bid, rentalPost, escrowData, timeRemaining }}>
      {children}
    </EscrowLifecycleContext.Provider>
  );
};
