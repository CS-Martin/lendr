import { CheckCircle, Clock } from 'lucide-react';
import { useEscrowLifecycle } from '../../providers/escrow-provider';
import { useState } from 'react';
import LendrButton from '@/components/shared/lendr-btn';
import { toast } from 'sonner';

export function Step4Active() {
    const { escrow, isRenter, completeStep4Settlement, isLoading, bid } = useEscrowLifecycle();
    const [txHash, setTxHash] = useState('');

    const handleCompleteSettlement = async () => {
        if (!escrow) return;

        try {
            await completeStep4Settlement({
                escrowId: escrow._id,
                txHash: txHash || undefined,
            });
            toast.success('Settlement completed successfully!');
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
                            Provide the transaction hash if you want to track the settlement transaction
                        </p>
                    </div>

                    <LendrButton
                        onClick={handleCompleteSettlement}
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
                                <span>Complete Settlement</span>
                            </div>
                        )}
                    </LendrButton>

                    <div className='text-xs text-blue-200 bg-blue-900/30 p-3 rounded-md'>
                        <strong>Note:</strong> This will complete the settlement. The NFT will be automatically returned from the
                        smart contract registry and the rental fee will be distributed.
                    </div>
                </div>
            )}

            {!isRenter && (
                <div className='text-sm text-blue-200 bg-blue-900/30 p-3 rounded-md'>
                    Settlement is ready to be processed. The NFT will be automatically returned from the smart contract registry
                    and the rental fee will be distributed.
                </div>
            )}
        </div>
    );
}
