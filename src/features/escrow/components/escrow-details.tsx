'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { ImageSection } from '@/components/shared/nft-components/image-section';
import { truncateText } from '@/lib/utils';
import { useEscrowLifecycle } from '../providers/escrow-provider';

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

export function EscrowDetails() {
  const { rentalPost, escrow, bid } = useEscrowLifecycle();

  if (!escrow || !rentalPost || !bid) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}>
      <Card className='bg-slate-900/50 border-slate-800 sticky top-24'>
        <CardHeader>
          <CardTitle className='text-white flex items-center space-x-2'>
            <Shield className='w-5 h-5 text-purple-400' />
            <span>Smart Contract Escrow</span>
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* NFT Preview */}
          <div className='text-center'>
            <ImageSection nft={rentalPost.nftMetadata} />
            <h3 className='text-lg font-semibold text-white mt-4'>{rentalPost.name}</h3>
            <Badge className='mt-2 bg-purple-500'>{rentalPost.category}</Badge>
          </div>

          <Separator className='bg-slate-800' />

          {/* Contract Participants */}
          <div className='space-y-3 text-sm'>
            <div className='flex justify-between'>
              <span className='text-slate-400'>Lender (Owner)</span>
              <span className='text-white font-mono'>{truncateText(escrow!.rentalPostOwnerAddress)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-slate-400'>Renter (Borrower)</span>
              <span className='text-white font-mono'>{truncateText(escrow!.rentalPostRenterAddress)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-slate-400'>Token ID</span>
              <span className='text-white font-mono'>{rentalPost.nftMetadata.tokenId}</span>
            </div>
          </div>

          <Separator className='bg-slate-800' />

          {/* Financial Details */}
          <div className='bg-slate-800 rounded-lg p-4 space-y-2'>
            <div className='flex justify-between text-sm'>
              <span className='text-slate-400'>Rental Fee</span>
              <span className='text-white'>{bid.bidAmount} POL</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-slate-400'>Collateral</span>
              <span className='text-cyan-400'>{rentalPost.collateral} POL</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-slate-400'>Platform Fee</span>
              <span className='text-amber-400'>0.01 POL</span>
            </div>
            <Separator className='bg-slate-700' />
            <div className='flex justify-between text-sm font-semibold'>
              <span className='text-white'>Total Locked</span>
              <span className='text-purple-400'>{bid.bidAmount + rentalPost.collateral} POL</span>
            </div>
          </div>

          {/* Contract Address */}
          <div>
            <div className='text-slate-400 text-sm mb-2'>Smart Contract ID:</div>
            <div className='flex items-center space-x-2'>
              <code className='text-xs text-white bg-slate-800 px-2 py-1 rounded font-mono flex-1'>{escrow._id}</code>
              <Button
                size='sm'
                variant='ghost'
                onClick={() => copyToClipboard(rentalPost.nftMetadata.contractAddress)}
                className='text-slate-400 hover:text-white'>
                <Copy className='w-4 h-4' />
              </Button>
            </div>
          </div>

          {/* Status Badge */}
          {/* <div className='text-center'>{getStatusBadge(escrowData.status)}</div> */}
        </CardContent>
      </Card>
    </motion.div>
  );
}
