import { useState } from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useEscrowLifecycle } from '../../providers/escrow-provider';
import LendrButton from '@/components/shared/lendr-btn';

export function Step2Active() {
  const { escrow, bid, rentalPost, rentalStartTime, completeStep, isLoading, isLender, isRenter } = useEscrowLifecycle();
  const [open, setOpen] = useState(false);

  if (!escrow || !rentalPost) {
    return null;
  }

  const handleSendNFT = () => {
    completeStep({ escrowId: escrow._id, stepNumber: 2 });
    setOpen(false);
  };

  console.log(bid?.rentalDuration);

  return (
    <div className='rounded-lg'>
      {isLender && (
        <div className='text-center'>
          <Dialog
            open={open}
            onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <LendrButton
                className='w-full'
                disabled={isLoading}>
                <CheckCircle className='w-4 h-4 mr-2' />
                {isLoading ? 'Processing...' : 'Send NFT to Escrow'}
              </LendrButton>
            </DialogTrigger>

            <DialogContent className='bg-slate-900 border-slate-800 text-white w-90 lg:w-full lg:max-w-lg'>
              <DialogHeader>
                <DialogTitle>Confirm NFT Transfer</DialogTitle>
              </DialogHeader>

              <div className='bg-slate-800 rounded-lg p-4 space-y-3 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-slate-400'>Render ID</span>
                  <span className='text-white font-mono'>
                    {escrow.rentalPostRenterAddress
                      ? escrow.rentalPostRenterAddress.slice(0, 8) + '...' + escrow.rentalPostRenterAddress.slice(-6)
                      : 'N/A'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-400'>Collateral Provided</span>
                  <span className='text-yellow-400 font-bold'>{rentalPost?.collateral} ETH</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-400'>Rental Duration</span>
                  <span className='text-white'>{bid?.rentalDuration} hour(s)</span>
                </div>
                <div className='flex flex-col lg:flex-row justify-between border-t border-slate-700 pt-2'>
                  <span className='text-slate-400'>Deadline</span>
                  <span className='text-orange-400 font-bold'>
                    {/* Get deadline from rentalStartTime + rentalDuration (in hours) */}
                    {bid?.rentalDuration && rentalStartTime
                      ? new Date(rentalStartTime + bid.rentalDuration * 60 * 60 * 1000).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                      : 'N/A'}
                  </span>
                </div>
              </div>

              <div className='text-xs text-slate-400 space-y-1 mt-3'>
                <p>• NFT will be locked in escrow and only released when rental ends.</p>
                <p>• There is a risk the renter may not return the NFT.</p>
                <p>• In such a case, the collateral will be transferred to you.</p>
                <p>• Ensure that collateral is at least equal to the NFT&apos;s market value.</p>
                <p>• Once confirmed, this action cannot be undone.</p>
              </div>

              <DialogFooter>
                <LendrButton
                  className='w-full'
                  variant='ghost'
                  onClick={() => setOpen(false)}>
                  Cancel
                </LendrButton>
                <LendrButton
                  className='w-full'
                  onClick={handleSendNFT}
                  disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Confirm & Send'}
                </LendrButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {isRenter && (
        <div className='text-center'>
          <div className='bg-blue-900/20 border border-blue-800 rounded-lg p-4'>
            <div className='flex items-center space-x-2 text-blue-400 mb-2'>
              <Clock className='w-4 h-4' />
              <span className='font-semibold'>Waiting for Lender</span>
            </div>
            <p className='text-slate-300 text-sm'>The lender must transfer the NFT to escrow before the deadline.</p>
          </div>
        </div>
      )}
    </div>
  );
}
