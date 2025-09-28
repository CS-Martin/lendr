import { useState } from 'react';
import { Clock, CheckCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useEscrowLifecycle } from '../../providers/escrow-provider';
import LendrButton from '@/components/shared/lendr-btn';
import { useAction } from 'convex/react';
import { api } from '@convex/_generated/api';
import { toast } from 'sonner';
import { useProgress } from '@bprogress/next';

export function Step2Active() {
  const { escrow, bid, rentalPost, rentalStartTime, completeStep, isLoading, isLender, isRenter } =
    useEscrowLifecycle();
  const [open, setOpen] = useState(false);
  const [isProcessingNFT, setIsProcessingNFT] = useState(false);
  const { start, stop } = useProgress();

  const approveNFT = useAction(api.customNftCollection.approveNftForDelegation);
  const depositNFT = useAction(api.delegation.depositNFTbyLender);
  const activateDelegation = useAction(api.delegation.activateDelegation);

  if (!escrow || !rentalPost) {
    return null;
  }

  const handleSendNFT = async () => {
    if (!escrow.smartContractRentalId) {
      toast.error('Smart contract rental ID not found. Please contact support.');
      return;
    }

    if (!rentalPost.nftMetadata?.tokenId) {
      toast.error('NFT token ID not found.');
      return;
    }

    setIsProcessingNFT(true);
    start();

    try {
      // Step 1: Approve the delegation registry to transfer the NFT
      const approveResult = await approveNFT({
        tokenId: rentalPost.nftMetadata.tokenId,
      });

      if (!approveResult.success) {
        throw new Error(approveResult.error || 'NFT approval failed');
      }

      // Step 2: Deposit NFT by lender
      const depositResult = await depositNFT({
        rentalId: escrow.smartContractRentalId,
      });

      if (!depositResult.success) {
        throw new Error(depositResult.error || 'NFT deposit failed');
      }

      // Step 3: Activate delegation
      const activateResult = await activateDelegation({
        rentalId: escrow.smartContractRentalId,
      });

      if (!activateResult.success) {
        throw new Error(activateResult.error || 'Delegation activation failed');
      }

      // All steps successful, complete the step
      await completeStep({
        escrowId: escrow._id,
        stepNumber: 2,
        txHash: activateResult.result?.txHash || '0xabc123de...89abc123',
      });

      toast.success('NFT sent and delegation activated successfully!');
      setOpen(false);
    } catch (error) {
      console.error('NFT send error:', error);
      toast.error(`NFT send failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessingNFT(false);
      stop();
    }
  };

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
                disabled={isLoading || isProcessingNFT}>
                {isProcessingNFT ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    Sending NFT...
                  </>
                ) : (
                  <>
                    <CheckCircle className='w-4 h-4 mr-2' />
                    Send NFT
                  </>
                )}
              </LendrButton>
            </DialogTrigger>

            <DialogContent className='bg-slate-900 border-slate-800 text-white w-90 lg:w-full lg:max-w-lg'>
              <DialogHeader>
                <DialogTitle>Send NFT and Activate Delegation</DialogTitle>
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
                <p>• This will approve the delegation registry to transfer your NFT.</p>
                <p>• The NFT will be deposited to the delegation registry.</p>
                <p>• The delegation will be activated for the rental period.</p>
                <p>• Once activated, the NFT will be available for the renter to use.</p>
                <p>• This is a required step to proceed with the rental process.</p>
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
                  disabled={isLoading || isProcessingNFT}>
                  {isProcessingNFT ? (
                    <>
                      <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                      Sending...
                    </>
                  ) : (
                    'Confirm & Send'
                  )}
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
