import { useEscrowLifecycle } from '../escrow-lifecycle-context';

export function Step5Pending() {
  const { rentalPost } = useEscrowLifecycle();

  return (
    <div className='bg-slate-800 rounded-lg p-4'>
      <div className='text-sm text-slate-400 mb-3'>Automatic settlement upon successful NFT return:</div>
      <div className='space-y-1 text-xs'>
        <div className='flex justify-between'>
          <span className='text-slate-400'>→ Collateral to Renter:</span>
          <span className='text-cyan-400'>{rentalPost.collateral} ETH</span>
        </div>
        <div className='flex justify-between'>
          <span className='text-slate-400'>→ Rental Fee to Lender:</span>
          <span className='text-green-400'>{rentalPost.collateral} ETH</span>
        </div>
        <div className='flex justify-between'>
          <span className='text-slate-400'>→ Platform Fee:</span>
          <span className='text-purple-400'>0.05 ETH</span>
        </div>
      </div>
    </div>
  );
}
