'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertTriangle, Coins, Shield, Clock } from 'lucide-react';
import { Doc } from '@convex/_generated/dataModel';
import { useProgress } from '@bprogress/next';

interface SettlementConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (txHash?: string) => Promise<void>;
  isLoading: boolean;
  escrow: Doc<'escrowSmartContracts'>;
  bid: Doc<'bids'> | null;
  rentalPost: Doc<'rentalposts'> | null;
}

export function SettlementConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  escrow,
  bid,
  rentalPost,
}: SettlementConfirmationModalProps) {
  const [txHash, setTxHash] = useState('');
  const { start, stop } = useProgress();

  // Calculate settlement amounts
  const rentalFee = bid?.bidAmount || 0;
  const rentalDuration = bid?.rentalDuration || 0;
  const totalRentalCost = rentalFee * rentalDuration;
  const platformFee = totalRentalCost * 0.025; // 2.5% platform fee
  const totalToLender = totalRentalCost - platformFee;

  const handleConfirm = async () => {
    start();
    try {
      await onConfirm(txHash || undefined);
      setTxHash(''); // Reset form
    } finally {
      stop();
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setTxHash(''); // Reset form
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleClose}>
      <DialogContent className='bg-slate-900 border-slate-700 text-white max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='text-xl font-bold text-center flex items-center justify-center space-x-2'>
            <AlertTriangle className='w-6 h-6 text-yellow-400' />
            <span>Confirm Settlement Completion</span>
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Warning Section */}
          <div className='bg-yellow-900/20 border border-yellow-800 rounded-lg p-4'>
            <div className='flex items-start space-x-3'>
              <AlertTriangle className='w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0' />
              <div className='text-sm text-yellow-200'>
                <p className='font-semibold mb-2'>Important: This action cannot be undone!</p>
                <p>
                  Completing the settlement will automatically return the NFT from the smart contract registry and
                  distribute the rental fee. Make sure you have completed all necessary transactions on-chain.
                </p>
              </div>
            </div>
          </div>

          {/* Settlement Summary */}
          <div className='bg-slate-800 rounded-lg p-4 space-y-4'>
            <h3 className='text-lg font-semibold text-white flex items-center space-x-2'>
              <Coins className='w-5 h-5 text-green-400' />
              <span>Settlement Summary</span>
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-slate-400'>Rental Fee (per hour)</span>
                  <span className='text-white'>{rentalFee.toFixed(4)} POL</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-400'>Rental Duration</span>
                  <span className='text-white'>{rentalDuration} hours</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-400'>Total Rental Cost</span>
                  <span className='text-white'>{totalRentalCost.toFixed(4)} POL</span>
                </div>
              </div>

              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-slate-400'>Platform Fee (2.5%)</span>
                  <span className='text-slate-400'>{platformFee.toFixed(4)} POL</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-400'>To Lender</span>
                  <span className='text-green-400 font-semibold'>{totalToLender.toFixed(4)} POL</span>
                </div>
              </div>
            </div>

            <Separator className='bg-slate-700' />

            <div className='flex justify-between items-center'>
              <span className='text-lg font-semibold text-white'>Total Settlement</span>
              <span className='text-2xl font-bold text-green-400'>{totalRentalCost.toFixed(4)} POL</span>
            </div>
          </div>

          {/* Transaction Hash Input */}
          <div className='space-y-2'>
            <Label
              htmlFor='txHash'
              className='text-slate-300'>
              Transaction Hash (Optional)
            </Label>
            <Input
              id='txHash'
              type='text'
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder='0x...'
              className='bg-slate-800 border-slate-700 text-white placeholder-slate-400'
            />
            <p className='text-xs text-slate-500'>
              Provide the transaction hash if you want to track the settlement transaction on-chain
            </p>
          </div>

          {/* What Happens Next */}
          <div className='bg-blue-900/20 border border-blue-800 rounded-lg p-4'>
            <h4 className='text-sm font-semibold text-blue-300 mb-3 flex items-center space-x-2'>
              <Clock className='w-4 h-4' />
              <span>What happens next?</span>
            </h4>
            <ul className='text-sm text-blue-200 space-y-1'>
              <li>• NFT will be automatically returned from the smart contract registry</li>
              <li>• Rental fee will be distributed to the lender (minus platform fee)</li>
              <li>• Escrow will be marked as completed</li>
              <li>• Both parties will receive confirmation notifications</li>
            </ul>
          </div>
        </div>

        <DialogFooter className='flex space-x-3'>
          <Button
            variant='outline'
            onClick={handleClose}
            disabled={isLoading}
            className='border-slate-600 text-slate-300 hover:bg-slate-800'>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className='bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0'>
            {isLoading ? (
              <div className='flex items-center space-x-2'>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                <span>Processing...</span>
              </div>
            ) : (
              <div className='flex items-center space-x-2'>
                <CheckCircle className='w-4 h-4' />
                <span>Confirm Settlement</span>
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
