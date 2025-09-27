import { useEscrowLifecycle } from '../../providers/escrow-provider';
import { CheckCircle, Clock } from 'lucide-react';

export function Step5Active() {
  const { rentalPost, bid } = useEscrowLifecycle();

  if (!rentalPost || !bid) {
    return null;
  }

  // Calculate rental fee based on bid amount and duration
  const rentalFee = bid.bidAmount;
  const collateral = rentalPost.collateral;
  const platformFee = 0.05; // Fixed platform fee
  const totalToRenter = collateral; // Collateral returned to renter
  const totalToLender = rentalFee; // Rental fee goes to lender

  return (
    <div className='bg-blue-900/20 border border-blue-800 rounded-lg p-4'>
      <div className='flex items-center space-x-2 text-blue-300 mb-3'>
        <Clock className='w-4 h-4' />
        <span className='font-semibold'>Settlement in Progress</span>
      </div>

      <div className='text-sm text-blue-200 mb-4'>
        Settlement is currently being processed. This should complete automatically.
      </div>

      <div className='space-y-3'>
        <div className='bg-slate-700/50 p-3 rounded-md'>
          <h4 className='text-sm font-semibold text-white mb-2'>Settlement Breakdown:</h4>
          <div className='space-y-2 text-sm'>
            <div className='flex justify-between items-center'>
              <span className='text-slate-400'>Collateral Returned to Renter:</span>
              <span className='text-cyan-400 font-mono'>{totalToRenter} ETH</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-slate-400'>Rental Fee to Lender:</span>
              <span className='text-green-400 font-mono'>{totalToLender} ETH</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-slate-400'>Platform Fee:</span>
              <span className='text-purple-400 font-mono'>{platformFee} ETH</span>
            </div>
            <div className='border-t border-slate-600 pt-2 mt-2'>
              <div className='flex justify-between items-center'>
                <span className='text-slate-300 font-semibold'>Total Transaction Value:</span>
                <span className='text-white font-mono font-bold'>
                  {totalToRenter + totalToLender + platformFee} ETH
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className='bg-blue-900/30 border border-blue-700 p-3 rounded-md'>
          <div className='flex items-center space-x-2 text-blue-300 mb-1'>
            <CheckCircle className='w-4 h-4' />
            <span className='text-sm font-semibold'>Processing</span>
          </div>
          <p className='text-xs text-blue-200'>Settlement is being processed. Please wait for completion.</p>
        </div>
      </div>
    </div>
  );
}
