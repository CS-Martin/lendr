import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { Doc, Id } from '@convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { useSession } from 'next-auth/react';

interface AcceptBidModalProps {
  bid: Doc<'bids'>;
  index: number;
  showAcceptModal: boolean;
  setShowAcceptModal: (show: boolean) => void;
  selectedBid: string | null;
  setSelectedBid: (bidId: string | null) => void;
  disabled: boolean;
}

export const AcceptBidModal = ({
  bid,
  showAcceptModal,
  setShowAcceptModal,
  selectedBid,
  setSelectedBid,
  disabled,
}: AcceptBidModalProps) => {
  const { data: session } = useSession();
  const user = session?.user;

  const acceptBid = useMutation(api.bids.acceptBid);
  const createEscrowSmartContract = useMutation(api.escrowSmartContract.createEscrowSmartContract);
  const updateRentalPost = useMutation(api.rentalpost.updateRentalPost);

  const handleAcceptBid = () => {
    Promise.all([
      // Accepts bid
      acceptBid({ bidId: bid._id }),

      // After accepting bid, create escrow smart contract
      createEscrowSmartContract({
        rentalPost: bid.rentalPostId,
        rentalPostRenterAddress: bid.bidderAddress as Id<'users'>,
        rentalPostOwnerAddress: user?.address as Id<'users'>,
        rentalFee: bid.bidAmount,
        collateral: bid.bidAmount,
        status: 'ACTIVE',
      }),

      // Change rental post status to accepted
      updateRentalPost({ id: bid.rentalPostId, status: 'RENTED', isBiddable: false }),
    ]);

    setShowAcceptModal(false);
  };
  return (
    <Dialog
      open={showAcceptModal && selectedBid === bid._id}
      onOpenChange={setShowAcceptModal}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setSelectedBid(bid._id)}
          disabled={disabled}
          className='flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed'>
          <CheckCircle className='w-4 h-4' />
          Accept Bid
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
              className='flex-1 border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent'>
              Cancel
            </Button>
            <Button
              onClick={handleAcceptBid}
              className='flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0'>
              Accept Bid
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
