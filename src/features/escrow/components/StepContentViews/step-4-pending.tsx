import { CheckCircle, Clock } from 'lucide-react';
import { useEscrowLifecycle } from '../../providers/escrow-provider';
import { useState, useMemo } from 'react';
import LendrButton from '@/components/shared/lendr-btn';
import { toast } from 'sonner';
import { SettlementConfirmationModal } from '../settlement-confirmation-modal';
import { useProgress } from '@bprogress/next';

export function Step4Pending() {
  const { escrow, isRenter, completeStep4Settlement, isLoading, bid, rentalPost, rentalStartTime, rentalDuration } =
    useEscrowLifecycle();
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const { start, stop } = useProgress();

  const handleCompleteSettlement = async (txHash?: string) => {
    if (!escrow) return;

    start();
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
    } finally {
      stop();
    }
  };

  // Calculate if rental period deadline has been met
  const isDeadlineMet = useMemo(() => {
    if (!rentalStartTime || !rentalDuration) return false;
    const rentalEndTime = rentalStartTime + rentalDuration * 60 * 60 * 1000; // Convert hours to milliseconds
    return Date.now() >= rentalEndTime;
  }, [rentalStartTime, rentalDuration]);

  // Calculate settlement amounts
  const rentalFee = bid?.bidAmount || 0;
  const platformFee = rentalFee * 0.025; // 2.5% platform fee
  const totalToLender = rentalFee - platformFee;

  if (!escrow) return null;

  return (
    <div className='bg-slate-800 rounded-lg p-4'>
      <div className='flex items-center space-x-3 mb-4'>
        <Clock className='w-6 h-6 text-blue-500' />
        <div>
          <h3 className='text-lg font-semibold text-white'>Settlement Pending</h3>
          <p className='text-sm text-slate-400'>
            The rental period has ended. Settlement will be processed automatically.
          </p>
        </div>
      </div>

      <div className='bg-slate-700/50 p-4 rounded-lg mb-4'>
        <h4 className='text-sm font-medium text-white mb-3'>Settlement Breakdown:</h4>
        <div className='space-y-2 text-sm'>
          <div className='flex justify-between'>
            <span className='text-slate-300'>Rental Fee:</span>
            <span className='text-white font-medium'>{rentalFee} POL</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-slate-300'>Platform Fee (2.5%):</span>
            <span className='text-white font-medium'>{platformFee.toFixed(4)} POL</span>
          </div>
          <div className='border-t border-slate-600 pt-2'>
            <div className='flex justify-between'>
              <span className='text-slate-300'>To Lender:</span>
              <span className='text-green-400 font-semibold'>{totalToLender.toFixed(4)} POL</span>
            </div>
          </div>
        </div>
      </div>

      <div className='bg-blue-900/20 border border-blue-800 p-3 rounded-md mb-4'>
        <div className='flex items-center space-x-2 text-blue-300 mb-1'>
          <CheckCircle className='w-4 h-4' />
          <span className='text-sm font-semibold'>Automatic Processing</span>
        </div>
        <p className='text-xs text-blue-200'>
          The NFT will be automatically returned from the smart contract registry and the rental fee will be
          distributed. No additional action required.
        </p>
      </div>

      {isRenter && (
        <div className='space-y-4'>
          <LendrButton
            onClick={() => setShowConfirmationModal(true)}
            disabled={isLoading || !isDeadlineMet}
            className={`w-full ${
              isDeadlineMet
                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                : 'bg-slate-600 cursor-not-allowed'
            }`}>
            <div className='flex items-center space-x-2'>
              {!isDeadlineMet ? (
                <>
                  <Clock className='w-4 h-4' />
                  <span>Waiting for Rental Period to End</span>
                </>
              ) : (
                <>
                  <CheckCircle className='w-4 h-4' />
                  <span>Complete Settlement</span>
                </>
              )}
            </div>
          </LendrButton>

          {!isDeadlineMet && (
            <div className='text-xs text-orange-200 bg-orange-900/30 p-3 rounded-md'>
              <strong>Note:</strong> Settlement will be available once the rental period ends. The rental period must
              complete before settlement can be processed.
            </div>
          )}
        </div>
      )}

      {!isRenter && (
        <div className='text-sm text-slate-400 bg-slate-700/50 p-3 rounded-md'>
          Settlement will be processed automatically. The NFT will be returned from the smart contract registry and the
          rental fee will be distributed.
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
