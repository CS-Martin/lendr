import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Doc, Id } from '@convex/_generated/dataModel';
import { useMutation, useAction } from 'convex/react';
import { api } from '@convex/_generated/api';
import { useSession } from 'next-auth/react';
import { useProgress } from '@bprogress/next';
import { toast } from 'sonner';
import { useState } from 'react';

interface AcceptBidModalProps {
  bid: Doc<'bids'>;
  rentalPost: Doc<'rentalposts'>;
  index: number;
  showAcceptModal: boolean;
  setShowAcceptModal: (show: boolean) => void;
  selectedBid: string | null;
  setSelectedBid: (bidId: string | null) => void;
  disabled: boolean;
}

export const AcceptBidModal = ({
  bid,
  rentalPost,
  showAcceptModal,
  setShowAcceptModal,
  selectedBid,
  setSelectedBid,
  disabled,
}: AcceptBidModalProps) => {
  const { start, stop } = useProgress();
  const { data: session } = useSession();
  const user = session?.user;
  const [isProcessing, setIsProcessing] = useState(false);

  const acceptBid = useMutation(api.bids.acceptBid);
  const createEscrowSmartContract = useAction(api.escrowSmartContract.createEscrowSmartContractWithAPI);
  const updateRentalPost = useMutation(api.rentalpost.updateRentalPost);

  const handleAcceptBid = async () => {
    if (isProcessing) return; // Prevent multiple clicks

    setIsProcessing(true);
    start();

    try {
      // Validate required data
      if (!user?.address) {
        throw new Error('User address is not available. Please ensure you are logged in.');
      }

      if (!rentalPost) {
        throw new Error('Rental post information is missing. Please try refreshing the page.');
      }

      // Execute operations sequentially to ensure proper error handling
      // 1. Create escrow smart contract first (this will fail if API call fails)
      await createEscrowSmartContract({
        bidId: bid._id,
        rentalPostId: bid.rentalPostId,
        rentalPostRenterAddress: bid.bidderAddress as Id<'users'>,
        rentalPostOwnerAddress: user.address as Id<'users'>,
        status: 'ACTIVE',
      });

      // 2. Accept the bid only if escrow creation succeeded
      await acceptBid({ bidId: bid._id });

      // 3. Update rental post status only if both escrow creation and bid acceptance succeeded
      await updateRentalPost({
        id: bid.rentalPostId,
        status: 'RENTED',
        isBiddable: false,
        // biddingStarttime: 0,
        // biddingEndtime: 0,
      });

      // Success - close modal and show success message
      toast.success('Bid accepted successfully!');
      setShowAcceptModal(false);

      // Optional: Redirect to escrow page
      // router.push(`/rentals/${bid.rentalPostId}/escrow`);
    } catch (error) {
      console.error('Error accepting bid:', error);

      // User-friendly error messages
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred while processing your request.';

      toast.error(`Error: ${errorMessage}`, {
        duration: 5000,
        position: 'top-right',
      });

      // Re-throw the error for error boundaries or additional error handling
      if (process.env.NODE_ENV === 'development') {
        console.error('Detailed error:', error);
      }
    } finally {
      setIsProcessing(false);
      stop();
    }
  };

  return (
    <Dialog
      open={showAcceptModal && selectedBid === bid._id}
      onOpenChange={setShowAcceptModal}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setSelectedBid(bid._id)}
          disabled={disabled || isProcessing}
          className='flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed'>
          {isProcessing ? <Loader2 className='w-4 h-4 animate-spin' /> : <CheckCircle className='w-4 h-4' />}
          {isProcessing ? 'Processing...' : 'Accept Bid'}
        </Button>
      </DialogTrigger>

      <DialogContent className='bg-slate-900 border-slate-800 text-white !max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-xl'>Accept Bid</DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          <div className='bg-slate-800 rounded-lg p-4 space-y-3'>
            <div className='flex justify-between'>
              <span className='text-slate-400'>Bidder</span>
              <span className='text-white font-mono'>
                {bid.bidderAddress.slice(0, 8)}...{bid.bidderAddress.slice(-6)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-slate-400'>Bid Amount</span>
              <span className='text-green-400 font-bold'>{bid.bidAmount} ETH/day</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-slate-400'>Duration</span>
              <span className='text-white'>{bid.rentalDuration} day(s)</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-slate-400'>Total Earnings</span>
              <span className='text-purple-400 font-bold'>
                {(Number.parseFloat(bid.bidAmount.toString()) * bid.rentalDuration).toFixed(3)} ETH
              </span>
            </div>
          </div>

          <div className='text-xs text-slate-400 space-y-1'>
            <p>• Accepting this bid will automatically reject all other bids</p>
            <p>• The rental will begin immediately after acceptance</p>
            <p>• You cannot change your mind once accepted</p>
          </div>

          <div className='flex space-x-3'>
            <Button
              variant='outline'
              onClick={() => setShowAcceptModal(false)}
              disabled={isProcessing}
              className='flex-1 border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed'>
              Cancel
            </Button>
            <Button
              onClick={handleAcceptBid}
              disabled={isProcessing}
              className='flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed'>
              {isProcessing ? (
                <>
                  <Loader2 className='w-4 h-4 animate-spin mr-2' />
                  Processing...
                </>
              ) : (
                'Accept Bid'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
