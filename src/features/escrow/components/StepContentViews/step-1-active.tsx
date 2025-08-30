import { useState } from 'react';
import { useEscrowLifecycle } from '@/features/escrow/providers/escrow-provider';
import LendrButton from '@/components/shared/lendr-btn';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CheckCircle } from 'lucide-react';

export function Step1Active() {
  const { escrow, bid, rentalPost, completeStep, isLoading, isLender, isRenter } = useEscrowLifecycle();
  const [open, setOpen] = useState(false);

  if (!escrow || !bid || !rentalPost) {
    return null;
  }

  const handleConfirmPayment = () => {
    completeStep({ escrowId: escrow._id, stepNumber: 1 });
    setOpen(false);
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
                  <span className='text-slate-400'>Total to Escrow</span>
                  <span className='text-purple-400 font-bold'>
                    {(bid?.bidAmount * bid?.rentalDuration + rentalPost?.collateral + 1).toFixed(3)} ETH
                  </span>
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
                  disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Confirm & Pay'}
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
