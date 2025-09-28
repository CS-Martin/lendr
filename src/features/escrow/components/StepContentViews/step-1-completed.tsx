import { CheckCircle } from 'lucide-react';
import { useEscrowLifecycle } from '../../providers/escrow-provider';

export function Step1Completed() {
  const { bid } = useEscrowLifecycle();

  if (!bid) {
    return null;
  }

  return (
    <div className='bg-green-900/20 border border-green-800 rounded-lg p-4'>
      <div className='flex items-center space-x-2 text-green-400 mb-2'>
        <CheckCircle className='w-4 h-4' />
        <span className='font-semibold'>Payment Successful</span>
      </div>
      <div className='text-sm text-slate-300'>Total deposited: {bid?.bidAmount} POL</div>
    </div>
  );
}
