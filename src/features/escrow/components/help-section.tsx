import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEscrowLifecycle } from './escrow-lifecycle-context';

export function HelpSection() {
  const { escrowData } = useEscrowLifecycle();

  return (
    <Card className='bg-slate-900/50 border-slate-800'>
      <CardContent className='p-6'>
        <h3 className='text-lg font-semibold text-white mb-4'>Smart Contract Protection</h3>
        <div className='space-y-2 text-sm text-slate-400'>
          <p>
            • <strong>Step 1:</strong> Renter payment is held in escrow until completion
          </p>
          <p>
            • <strong>Step 2:</strong> 1-day deadline for lender to send NFT (auto-cancel if missed)
          </p>
          <p>
            • <strong>Step 3:</strong> Rental period enforced by smart contract
          </p>
          <p>
            • <strong>Step 4:</strong> 3-day return window (collateral forfeited if missed)
          </p>
          <p>
            • <strong>Step 5:</strong> Automatic payout distribution upon successful return
          </p>
        </div>
        <div className='mt-4 p-3 bg-purple-900/20 border border-purple-800 rounded-lg'>
          <div className='text-sm text-purple-300'>
            <strong>Current Status:</strong> {escrowData.status}
          </div>
        </div>
        <Button
          variant='outline'
          className='mt-4 border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent'>
          Contact Support
        </Button>
      </CardContent>
    </Card>
  );
}
