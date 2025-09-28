import { useState } from 'react';
import { useEscrowLifecycle } from '@/features/escrow/providers/escrow-provider';
import LendrButton from '@/components/shared/lendr-btn';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useAction } from 'convex/react';
import { api } from '@convex/_generated/api';
import { toast } from 'sonner';
import { useProgress } from '@bprogress/next';

export function Step1Active() {
  const { escrow, bid, rentalPost, completeStep, isLoading, isLender, isRenter } = useEscrowLifecycle();
  const [open, setOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { start, stop } = useProgress();

  const initiatePayment = useAction(api.delegation.initiateDelegationRentalPayment);

  if (!escrow || !bid || !rentalPost) {
    return null;
  }

  const handleConfirmPayment = async () => {
    if (!escrow.smartContractRentalId) {
      toast.error('Smart contract rental ID not found. Please contact support.');
      return;
    }

    setIsProcessingPayment(true);
    start();

    try {
      // Calculate payment amount (rental fee in wei)
      const paymentAmount = Math.floor(bid.bidAmount * 1e18).toString();

      // Call the payment API
      const paymentResult = await initiatePayment({
        rentalId: escrow.smartContractRentalId,
        payment: paymentAmount,
      });

      if (paymentResult.success) {
        // Payment successful, complete the step
        await completeStep({
          escrowId: escrow._id,
          stepNumber: 1,
          txHash: paymentResult.result?.txHash || '0xabc123de...89abc123',
        });

        toast.success('Payment successful! Rental process initiated.');
        setOpen(false);
      } else {
        throw new Error(paymentResult.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessingPayment(false);
      stop();
    }
  };

  return (
    <div className='rounded-lg'>
      {isRenter && (
        <div className='text-center'>
          <Dialog
            open={open}
            onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <LendrButton
                className='w-full'
                disabled={isLoading}>
                <CheckCircle className='w-4 h-4 mr-2' />
                {isLoading ? 'Processing...' : 'Pay Now'}
              </LendrButton>
            </DialogTrigger>

            <DialogContent className='bg-slate-900 border-slate-800 text-white !max-w-md'>
              <DialogHeader>
                <DialogTitle>Confirm Payment</DialogTitle>
              </DialogHeader>

              <div className='bg-slate-800 rounded-lg p-4 space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-slate-400'>Counterparty</span>
                  <span className='text-white font-mono'>
                    {escrow.rentalPostOwnerAddress.slice(0, 8)}...{escrow.rentalPostOwnerAddress.slice(-6)}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-400'>Rental Fee</span>
                  <span className='text-green-400 font-bold'>{bid?.totalBidAmount} ETH/day</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-400'>Duration</span>
                  <span className='text-white'>{bid?.rentalDuration} day(s)</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-400'>Collateral</span>
                  <span className='text-yellow-400 font-bold'>{rentalPost?.collateral} ETH</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-400'>Platform Fee</span>
                  <span className='text-yellow-400 font-bold'>1 ETH</span>
                </div>
                <div className='flex justify-between border-t border-slate-700 pt-2'>
                  <span className='text-slate-400'>Rental Fee</span>
                  <span className='text-purple-400 font-bold'>{bid?.bidAmount.toFixed(4)} ETH</span>
                </div>
              </div>

              <div className='text-xs text-slate-400 space-y-1 mt-3'>
                <p>• Payment will be locked in escrow until rental completion.</p>
                <p>• Collateral protects both parties — returned when conditions are met.</p>
                <p>• Escrow auto-cancels if no progress within expiry time.</p>
                <p>• Once confirmed, this action cannot be undone.</p>
              </div>

              <DialogFooter>
                <LendrButton
                  variant='ghost'
                  onClick={() => setOpen(false)}>
                  Cancel
                </LendrButton>
                <LendrButton
                  onClick={handleConfirmPayment}
                  disabled={isLoading || isProcessingPayment}>
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className='w-4 h-4 animate-spin mr-2' />
                      Processing Payment...
                    </>
                  ) : (
                    'Confirm & Pay'
                  )}
                </LendrButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {isLender && (
        <div className='text-center'>
          <p className='text-slate-300'>Waiting for the renter to pay the rental fee and collateral.</p>
        </div>
      )}
    </div>
  );
}
