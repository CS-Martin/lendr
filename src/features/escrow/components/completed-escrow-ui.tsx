'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Coins, Clock, Shield, TrendingUp, ExternalLink, Copy, Calendar, User, Hash } from 'lucide-react';
import { Doc } from '@convex/_generated/dataModel';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface CompletedEscrowUIProps {
  escrow: Doc<'escrowSmartContracts'>;
  bid: Doc<'bids'> | null;
  rentalPost: Doc<'rentalposts'> | null;
  steps: Doc<'escrowSmartContractSteps'>[];
}

export function CompletedEscrowUI({ escrow, bid, rentalPost, steps }: CompletedEscrowUIProps) {
  // Calculate settlement amounts
  const rentalFee = bid?.bidAmount || 0;
  const rentalDuration = bid?.rentalDuration || 0;
  const totalRentalCost = rentalFee * rentalDuration;
  const platformFee = totalRentalCost * 0.025; // 2.5% platform fee
  const totalToLender = totalRentalCost - platformFee;

  // Get completion timestamp from step 4
  const completionStep = steps.find((step) => step.stepNumber === 4 && step.status === 'COMPLETED');
  const completionTime = completionStep?.timestamp || Date.now();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className='space-y-6'>
      {/* Success Header */}
      <Card className='bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-800'>
        <CardContent className='p-6 text-center'>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className='mb-4'>
            <CheckCircle className='w-16 h-16 text-green-400 mx-auto' />
          </motion.div>
          <h1 className='text-2xl font-bold text-white mb-2'>Escrow Completed Successfully!</h1>
          <p className='text-green-200 mb-4'>
            The rental process has been completed and all funds have been distributed.
          </p>
          <Badge
            variant='secondary'
            className='bg-green-800 text-green-200 border-green-700'>
            <Clock className='w-3 h-3 mr-1' />
            Completed {formatDistanceToNow(completionTime)} ago
          </Badge>
        </CardContent>
      </Card>

      {/* Settlement Summary */}
      <Card className='bg-slate-900/50 border-slate-800'>
        <CardHeader>
          <CardTitle className='text-white flex items-center space-x-2'>
            <Coins className='w-5 h-5 text-green-400' />
            <span>Settlement Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-3'>
              <div className='flex justify-between items-center'>
                <span className='text-slate-400'>Rental Fee (per hour)</span>
                <span className='text-white font-mono'>{rentalFee.toFixed(4)} ETH</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-slate-400'>Rental Duration</span>
                <span className='text-white'>{rentalDuration} hours</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-slate-400'>Total Rental Cost</span>
                <span className='text-white font-mono'>{totalRentalCost.toFixed(4)} ETH</span>
              </div>
            </div>

            <div className='space-y-3'>
              <div className='flex justify-between items-center'>
                <span className='text-slate-400'>Platform Fee (2.5%)</span>
                <span className='text-slate-400 font-mono'>{platformFee.toFixed(4)} ETH</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-slate-400'>Distributed to Lender</span>
                <span className='text-green-400 font-semibold font-mono'>{totalToLender.toFixed(4)} ETH</span>
              </div>
            </div>
          </div>

          <Separator className='bg-slate-700' />

          <div className='flex justify-between items-center'>
            <span className='text-lg font-semibold text-white'>Total Settlement</span>
            <span className='text-2xl font-bold text-green-400 font-mono'>{totalRentalCost.toFixed(4)} ETH</span>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Details */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Participants */}
        <Card className='bg-slate-900/50 border-slate-800'>
          <CardHeader>
            <CardTitle className='text-white flex items-center space-x-2'>
              <User className='w-5 h-5 text-blue-400' />
              <span>Participants</span>
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-3'>
              <div>
                <span className='text-slate-400 text-sm'>Lender (Owner)</span>
                <div className='flex items-center justify-between mt-1'>
                  <span className='text-white font-mono text-sm'>{formatAddress(escrow.rentalPostOwnerAddress)}</span>
                  <button
                    onClick={() => copyToClipboard(escrow.rentalPostOwnerAddress, 'Lender address')}
                    className='text-slate-400 hover:text-white transition-colors'>
                    <Copy className='w-4 h-4' />
                  </button>
                </div>
              </div>
              <div>
                <span className='text-slate-400 text-sm'>Renter</span>
                <div className='flex items-center justify-between mt-1'>
                  <span className='text-white font-mono text-sm'>{formatAddress(escrow.rentalPostRenterAddress)}</span>
                  <button
                    onClick={() => copyToClipboard(escrow.rentalPostRenterAddress, 'Renter address')}
                    className='text-slate-400 hover:text-white transition-colors'>
                    <Copy className='w-4 h-4' />
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Escrow Details */}
        <Card className='bg-slate-900/50 border-slate-800'>
          <CardHeader>
            <CardTitle className='text-white flex items-center space-x-2'>
              <Hash className='w-5 h-5 text-purple-400' />
              <span>Escrow Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-3'>
              <div>
                <span className='text-slate-400 text-sm'>Escrow ID</span>
                <div className='flex items-center justify-between mt-1'>
                  <span className='text-white font-mono text-sm'>{formatAddress(escrow._id)}</span>
                  <button
                    onClick={() => copyToClipboard(escrow._id, 'Escrow ID')}
                    className='text-slate-400 hover:text-white transition-colors'>
                    <Copy className='w-4 h-4' />
                  </button>
                </div>
              </div>
              <div>
                <span className='text-slate-400 text-sm'>Rental Post</span>
                <div className='flex items-center justify-between mt-1'>
                  <span className='text-white font-mono text-sm'>{formatAddress(escrow.rentalPostId)}</span>
                  <button
                    onClick={() => copyToClipboard(escrow.rentalPostId, 'Rental Post ID')}
                    className='text-slate-400 hover:text-white transition-colors'>
                    <Copy className='w-4 h-4' />
                  </button>
                </div>
              </div>
              <div>
                <span className='text-slate-400 text-sm'>Completion Time</span>
                <div className='flex items-center justify-between mt-1'>
                  <span className='text-white text-sm'>{new Date(completionTime).toLocaleString()}</span>
                  <Calendar className='w-4 h-4 text-slate-400' />
                </div>
              </div>
              {escrow.smartContractRentalId && (
                <div>
                  <span className='text-slate-400 text-sm'>Smart Contract Rental ID</span>
                  <div className='flex items-center justify-between mt-1'>
                    <span className='text-white font-mono text-sm'>{escrow.smartContractRentalId}</span>
                    <button
                      onClick={() => copyToClipboard(escrow.smartContractRentalId!, 'Smart Contract Rental ID')}
                      className='text-slate-400 hover:text-white transition-colors'>
                      <Copy className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Process Timeline */}
      <Card className='bg-slate-900/50 border-slate-800'>
        <CardHeader>
          <CardTitle className='text-white flex items-center space-x-2'>
            <TrendingUp className='w-5 h-5 text-orange-400' />
            <span>Process Timeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {steps.map((step, index) => (
              <motion.div
                key={step.stepNumber}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className='flex items-center space-x-4'>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${step.status === 'COMPLETED' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-400'
                    }`}>
                  {step.status === 'COMPLETED' ? (
                    <CheckCircle className='w-4 h-4' />
                  ) : (
                    <span className='text-sm font-semibold'>{step.stepNumber}</span>
                  )}
                </div>
                <div className='flex-1'>
                  <div className='flex items-center justify-between'>
                    <span className='text-white font-medium'>{step.title}</span>
                    {step.status === 'COMPLETED' && step.timestamp && (
                      <span className='text-slate-400 text-sm'>{formatDistanceToNow(step.timestamp)} ago</span>
                    )}
                  </div>
                  <p className='text-slate-400 text-sm'>{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className='bg-blue-900/20 border-blue-800'>
        <CardContent className='p-4'>
          <div className='flex items-start space-x-3'>
            <Shield className='w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0' />
            <div className='text-sm text-blue-200'>
              <p className='font-semibold mb-2'>Security & Transparency</p>
              <p>
                This escrow was secured by smart contracts and all transactions are recorded on-chain. You can verify
                the settlement by checking the transaction hash on a blockchain explorer.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
