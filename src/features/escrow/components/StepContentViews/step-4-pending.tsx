
import { AlertCircle } from 'lucide-react';
import { Doc } from '@convex/_generated/dataModel';

interface Step4PendingProps {
  step: Doc<'escrowSmartContractSteps'>;
}

export function Step4Pending({ step }: Step4PendingProps) {
  return (
    <div className='bg-slate-800 rounded-lg p-4'>
      <div className='flex items-center space-x-2 text-slate-400 mb-2'>
        <AlertCircle className='w-4 h-4' />
        <span className='font-semibold'>Return Required</span>
      </div>
      <div className='text-sm text-slate-400 mb-2'>
        NFT must be returned directly to lender within 3 days after rental ends
      </div>
      <div className='text-xs text-orange-300'>⚠️ {step.warning}</div>
    </div>
  );
}
