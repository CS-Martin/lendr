
import { AlertCircle } from 'lucide-react';

export function Step3Pending() {
  return (
    <div className='bg-slate-800 rounded-lg p-4'>
      <div className='flex items-center space-x-2 text-slate-400 mb-2'>
        <AlertCircle className='w-4 h-4' />
        <span className='font-semibold'>Awaiting Step 2 Completion</span>
      </div>
      <div className='text-sm text-slate-400'>
        Rental period will begin once NFT is received in escrow
      </div>
    </div>
  );
}
