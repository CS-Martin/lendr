import { CheckCircle, Clock } from 'lucide-react';
import { useEscrowLifecycle } from '../../providers/escrow-provider';
import { useState } from 'react';
import LendrButton from '@/components/shared/lendr-btn';
import { toast } from 'sonner';
import { SettlementConfirmationModal } from '../settlement-confirmation-modal';

export function Step4Active() {
  const { escrow, isRenter, completeStep4Settlement, isLoading, bid, rentalPost } = useEscrowLifecycle();
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const handleCompleteSettlement = async (txHash?: string) => {
    if (!escrow) return;

    try {
      await completeStep4Settlement({
        escrowId: escrow._id,
        txHash: txHash,
      });
      toast.success('Settlement completed successfully!');
      setShowConfirmationModal(false);
    } catch (error) {
      toast.error('Failed to complete settlement. Please try again.');
      console.error('Error completing settlement:', error);
    }
  };

  if (!escrow) return null;

  // Calculate settlement amounts
  const rentalFee = bid?.bidAmount || 0;
  const platformFee = rentalFee * 0.025; // 2.5% platform fee
  const totalToLender = rentalFee - platformFee;

  return (
    <div className='bg-blue-900/20 border border-blue-800 rounded-lg p-4'>
      <div className='flex items-center space-x-3 mb-4'>
        <Clock className='w-6 h-6 text-blue-500' />
        <div>
          <h3 className='text-lg font-semibold text-white'>Settlement Active</h3>
          <p className='text-sm text-blue-200'>The rental period has ended. Settlement is ready to be processed.</p>
        </div>
      </div>

      <div className='bg-slate-700/50 p-4 rounded-lg mb-4'>
        <h4 className='text-sm font-medium text-white mb-3'>Settlement Breakdown:</h4>
        <div className='space-y-2 text-sm'>
          <div className='flex justify-between'>
            <span className='text-slate-300'>Rental Fee:</span>
            <span className='text-white font-medium'>{rentalFee} ETH</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-slate-300'>Platform Fee (2.5%):</span>
            <span className='text-white font-medium'>{platformFee.toFixed(4)} ETH</span>
          </div>
          <div className='border-t border-slate-600 pt-2'>
            <div className='flex justify-between'>
              <span className='text-slate-300'>To Lender:</span>
              <span className='text-green-400 font-semibold'>{totalToLender.toFixed(4)} ETH</span>
            </div>
          </div>
        </div>
      </div>

      {isRenter && (
        <div className='space-y-4'>
          <LendrButton
            onClick={() => setShowConfirmationModal(true)}
            disabled={isLoading}
            className='w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'>
            <div className='flex items-center space-x-2'>
              <CheckCircle className='w-4 h-4' />
              <span>Complete Settlement</span>
            </div>
          </LendrButton>

          <div className='text-xs text-blue-200 bg-blue-900/30 p-3 rounded-md'>
            <strong>Note:</strong> Click the button above to review and confirm the settlement details before completion.
          </div>
        </div>
      )}

      {!isRenter && (
        <div className='text-sm text-blue-200 bg-blue-900/30 p-3 rounded-md'>
          Settlement is ready to be processed. The NFT will be automatically returned from the smart contract registry
          and the rental fee will be distributed.
        </div>
      )}

      {/* Settlement Confirmation Modal */}
      <SettlementConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleCompleteSettlement}
        isLoading={isLoading}
        escrow={escrow}
        bid={bid}
        rentalPost={rentalPost}
      />
    </div>
  );
}
