import { Separator } from '@/components/ui/separator';
import { formatDuration } from '@/lib/utils';
import { type BidCostBreakdown } from '../types/bidding';

interface BidCostBreakdownProps {
  costBreakdown: BidCostBreakdown;
  rentalDuration: number;
}

export function BidCostBreakdown({ costBreakdown, rentalDuration }: BidCostBreakdownProps) {
  return (
    <div className='bg-slate-800 rounded-lg p-4 space-y-3'>
      <div className='flex justify-between'>
        <span className='text-slate-400'>Bid Total ({formatDuration(rentalDuration)})</span>
        <span className='text-white'>{costBreakdown.totalRentalCost.toFixed(4)} ETH</span>
      </div>
      <div className='flex justify-between'>
        <span className='text-slate-400'>Collateral (refundable)</span>
        <span className='text-cyan-400'>{costBreakdown.collateral.toFixed(4)} ETH</span>
      </div>

      <Separator className='bg-slate-700' />
      <div className='flex justify-between font-semibold'>
        <span className='text-white'>Total Required</span>
        <span className='text-orange-400'>{costBreakdown.totalRequired.toFixed(4)} ETH</span>
      </div>
    </div>
  );
}
