import { AlertCircle, CheckCircle } from 'lucide-react';
import { useEscrowLifecycle } from '../../providers/escrow-provider';
import { useState } from 'react';
import LendrButton from '@/components/shared/lendr-btn';
import { toast } from 'sonner';

export function Step4Pending() {
  const { escrow, isRenter, completeStep4ReturnNFT, isLoading } = useEscrowLifecycle();
  const [txHash, setTxHash] = useState('');

  const handleReturnNFT = async () => {
    if (!escrow) return;

    try {
      await completeStep4ReturnNFT({
        escrowId: escrow._id,
        txHash: txHash || undefined,
      });
      toast.success('NFT returned successfully! Settlement completed.');
    } catch (error) {
      toast.error('Failed to return NFT. Please try again.');
      console.error('Error returning NFT:', error);
    }
  };

  if (!escrow) return null;

  return (
    <div className='bg-slate-800 rounded-lg p-4'>
      <div className='flex items-center space-x-2 text-slate-400 mb-2'>
        <AlertCircle className='w-4 h-4' />
        <span className='font-semibold'>Return Required</span>
      </div>
      <div className='text-sm text-slate-400 mb-4'>
        NFT must be returned directly to lender within 3 days after rental ends
      </div>

      {isRenter && (
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-slate-300 mb-2'>Transaction Hash (Optional)</label>
            <input
              type='text'
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder='0x...'
              className='w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
            <p className='text-xs text-slate-500 mt-1'>
              Enter the transaction hash if you have already returned the NFT on-chain
            </p>
          </div>

          <LendrButton
            onClick={handleReturnNFT}
            disabled={isLoading}
            className='w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'>
            {isLoading ? (
              <div className='flex items-center space-x-2'>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                <span>Processing...</span>
              </div>
            ) : (
              <div className='flex items-center space-x-2'>
                <CheckCircle className='w-4 h-4' />
                <span>Return NFT & Complete Settlement</span>
              </div>
            )}
          </LendrButton>

          <div className='text-xs text-slate-500 bg-slate-700/50 p-3 rounded-md'>
            <strong>Note:</strong> This action will automatically complete both step 4 (NFT return) and step 5
            (settlement). The rental fee will be sent to the lender and your collateral will be returned.
          </div>
        </div>
      )}

      {!isRenter && (
        <div className='text-sm text-slate-400 bg-slate-700/50 p-3 rounded-md'>
          Waiting for the renter to return the NFT. Once returned, the settlement will be processed automatically.
        </div>
      )}
    </div>
  );
}
