'use client';

import { useAccount } from 'wagmi';
import { useEscrowLifecycle } from '@/features/escrow/providers/escrow-provider';
import { Button } from '@/components/ui/button';

export function Step1Active() {
    const { address } = useAccount();
    const { escrow, completeStep, isLoading } = useEscrowLifecycle();

    if (!escrow) {
        return null;
    }

    const isRenter = address === escrow.rentalPostRenterAddress;
    const isLender = address === escrow.rentalPostOwnerAddress;

    const handlePayment = () => {
        completeStep({ escrowId: escrow._id, stepNumber: 1 });
    };

    return (
        <div className="p-4 bg-slate-800 rounded-lg">
            {isRenter && (
                <div className="text-center">
                    <p className="text-slate-300 mb-4">You need to pay the rental fee and collateral to proceed.</p>
                    <Button onClick={handlePayment} disabled={isLoading}>
                        {isLoading ? 'Processing...' : 'Pay Now'}
                    </Button>
                </div>
            )}
            {isLender && (
                <div className="text-center">
                    <p className="text-slate-300">Waiting for the renter to pay the rental fee and collateral.</p>
                </div>
            )}
        </div>
    );
}
