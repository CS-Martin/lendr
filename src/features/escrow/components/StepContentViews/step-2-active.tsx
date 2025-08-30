import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Doc } from '@convex/_generated/dataModel';

interface Step2ActiveProps {
  step: Doc<'escrowSmartContractSteps'>;
}

export function Step2Active({ step }: Step2ActiveProps) {
  return (
    <div className='space-y-3'>
      <div className='bg-blue-900/20 border border-blue-800 rounded-lg p-4'>
        <div className='flex items-center space-x-2 text-blue-400 mb-2'>
          <Clock className='w-4 h-4' />
          <span className='font-semibold'>Waiting for Lender</span>
        </div>
        <div className='text-sm text-slate-300 mb-2'>Lender must transfer NFT to escrow contract within 1 day</div>
        <div className='text-xs text-orange-300'>⚠️ {step.warning}</div>
      </div>
      <Button className='w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0'>
        Send NFT to Escrow (Lender Action)
      </Button>
    </div>
  );
}
